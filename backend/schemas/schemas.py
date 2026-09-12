from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    """Production Google OAuth request containing verified ID Token."""
    id_token: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

# Item schemas
class ItemCreate(BaseModel):
    name: str
    category: str
    description: str
    color: str
    brand: Optional[str] = ""
    location: str
    date_lost: Optional[str] = None  # for lost
    date_found: Optional[str] = None # for found
    additional_details: Optional[str] = ""

class LostItemResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    description: str
    color: str
    brand: Optional[str]
    location: str
    date_lost: str
    image_url: Optional[str]
    additional_details: Optional[str]
    status: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class FoundItemResponse(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    description: str
    color: str
    brand: Optional[str]
    location: str
    date_found: str
    image_url: Optional[str]
    additional_details: Optional[str]
    status: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

# Match schemas
class MatchResponse(BaseModel):
    id: int
    lost_item_id: int
    found_item_id: int
    total_score: float
    text_score: float
    image_score: Optional[float]
    category_score: float
    color_score: float
    brand_score: float
    location_score: float
    date_score: float
    explanations: List[str]
    status: str
    created_at: datetime
    lost_item: Optional[LostItemResponse] = None
    found_item: Optional[FoundItemResponse] = None

    class Config:
        from_attributes = True

class MatchStatusUpdate(BaseModel):
    status: str  # 'potential', 'confirmed', 'rejected', 'returned'

# Notification schema
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    match_id: Optional[int]
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Admin stats schema
class AdminStatsResponse(BaseModel):
    total_lost_reports: int
    total_found_reports: int
    potential_matches: int
    confirmed_matches: int
    returned_items: int
