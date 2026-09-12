from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import User
from backend.schemas.schemas import UserCreate, UserLogin, GoogleLoginRequest, Token, UserResponse, UserProfileUpdate
from backend.services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from backend.config import GOOGLE_CLIENT_ID
import httpx, os, hashlib

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/config")
def get_auth_config():
    """Returns public authentication configuration (e.g. Google Client ID)."""
    return {
        "google_client_id": GOOGLE_CLIENT_ID,
        "google_auth_configured": bool(GOOGLE_CLIENT_ID)
    }


@router.post("/google", response_model=Token)
async def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Production Google OAuth 2.0 endpoint. Verifies ID token with Google's tokeninfo service."""
    if not payload.id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth ID token is required."
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.id_token}"
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Google OAuth authentication token."
            )
        google_info = resp.json()
        
        # 1. Verify Issuer
        issuer = google_info.get("iss")
        if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token issuer."
            )

        # 2. Verify Audience if GOOGLE_CLIENT_ID is configured
        if GOOGLE_CLIENT_ID and google_info.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google OAuth Client ID mismatch."
            )
        
        # 3. Verify Email Verification Status
        email_verified = google_info.get("email_verified")
        if email_verified is False or str(email_verified).lower() == "false":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unverified Google email address cannot be authenticated."
            )

        email = google_info.get("email")
        full_name = google_info.get("name") or google_info.get("email")
        google_sub_id = google_info.get("sub")
        
        if not email or not google_sub_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account did not return a valid email or account identifier."
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to contact Google authentication servers. Please check server network connectivity."
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google authentication token verification failed."
        )

    # 1. Lookup user by google_id
    user = db.query(User).filter(User.google_id == google_sub_id).first()

    # 2. If not found by google_id, lookup by verified email and link google_id
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_sub_id
            db.commit()
            db.refresh(user)

    # 3. Create new user account if user does not exist
    if not user:
        user = User(
            email=email,
            password_hash=hash_password(os.urandom(24).hex()),
            full_name=full_name,
            role="user",
            google_id=google_sub_id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's profile fields."""
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.location is not None:
        current_user.location = profile_in.location
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently delete the current user's account and all associated data."""
    db.delete(current_user)
    db.commit()
    return None

