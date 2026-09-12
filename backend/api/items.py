import os
import json
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from backend.config import UPLOAD_DIR, HIGH_MATCH_THRESHOLD
from backend.database.database import get_db
from backend.models.models import User, LostItem, FoundItem, Match, Notification
from backend.schemas.schemas import LostItemResponse, FoundItemResponse
from backend.services.auth_service import get_current_user
from backend.ai.matching_engine import calculate_match_score

router = APIRouter(prefix="/api/items", tags=["Items"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def save_uploaded_file(file: Optional[UploadFile]) -> Optional[str]:
    if not file or not file.filename:
        return None
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Allowed: JPG, PNG, WEBP, GIF"
        )
    
    # Read file content and validate size
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image size exceeds maximum limit of 5MB"
        )

    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    return f"/uploads/{filename}"


def trigger_matching_for_lost(lost_item: LostItem, db: Session):
    found_items = db.query(FoundItem).filter(FoundItem.status == "active").all()
    for found in found_items:
        match_data = calculate_match_score(lost_item, found, UPLOAD_DIR)
        
        # Check if match record already exists
        existing = db.query(Match).filter(
            Match.lost_item_id == lost_item.id,
            Match.found_item_id == found.id
        ).first()

        explanations_str = json.dumps(match_data["explanations"])
        
        if existing:
            existing.total_score = match_data["total_score"]
            existing.text_score = match_data["text_score"]
            existing.image_score = match_data["image_score"]
            existing.category_score = match_data["category_score"]
            existing.color_score = match_data["color_score"]
            existing.brand_score = match_data["brand_score"]
            existing.location_score = match_data["location_score"]
            existing.date_score = match_data["date_score"]
            existing.explanations_json = explanations_str
            match_obj = existing
        else:
            match_obj = Match(
                lost_item_id=lost_item.id,
                found_item_id=found.id,
                total_score=match_data["total_score"],
                text_score=match_data["text_score"],
                image_score=match_data["image_score"],
                category_score=match_data["category_score"],
                color_score=match_data["color_score"],
                brand_score=match_data["brand_score"],
                location_score=match_data["location_score"],
                date_score=match_data["date_score"],
                explanations_json=explanations_str,
                status="potential"
            )
            db.add(match_obj)

        db.commit()
        db.refresh(match_obj)

        # Trigger notification if score >= threshold (80%)
        if match_data["total_score"] >= (HIGH_MATCH_THRESHOLD * 100.0):
            # Notify lost item owner
            msg1 = f"Potential match found for your lost {lost_item.name} — {match_data['total_score']}% similarity score."
            notif1 = Notification(user_id=lost_item.user_id, match_id=match_obj.id, message=msg1)
            db.add(notif1)

            # Notify found item owner if different user
            if found.user_id != lost_item.user_id:
                msg2 = f"Potential match found for your reported found {found.name} — {match_data['total_score']}% similarity score."
                notif2 = Notification(user_id=found.user_id, match_id=match_obj.id, message=msg2)
                db.add(notif2)

            db.commit()


def trigger_matching_for_found(found_item: FoundItem, db: Session):
    lost_items = db.query(LostItem).filter(LostItem.status == "active").all()
    for lost in lost_items:
        match_data = calculate_match_score(lost, found_item, UPLOAD_DIR)
        
        existing = db.query(Match).filter(
            Match.lost_item_id == lost.id,
            Match.found_item_id == found_item.id
        ).first()

        explanations_str = json.dumps(match_data["explanations"])

        if existing:
            existing.total_score = match_data["total_score"]
            existing.text_score = match_data["text_score"]
            existing.image_score = match_data["image_score"]
            existing.category_score = match_data["category_score"]
            existing.color_score = match_data["color_score"]
            existing.brand_score = match_data["brand_score"]
            existing.location_score = match_data["location_score"]
            existing.date_score = match_data["date_score"]
            existing.explanations_json = explanations_str
            match_obj = existing
        else:
            match_obj = Match(
                lost_item_id=lost.id,
                found_item_id=found_item.id,
                total_score=match_data["total_score"],
                text_score=match_data["text_score"],
                image_score=match_data["image_score"],
                category_score=match_data["category_score"],
                color_score=match_data["color_score"],
                brand_score=match_data["brand_score"],
                location_score=match_data["location_score"],
                date_score=match_data["date_score"],
                explanations_json=explanations_str,
                status="potential"
            )
            db.add(match_obj)

        db.commit()
        db.refresh(match_obj)

        if match_data["total_score"] >= (HIGH_MATCH_THRESHOLD * 100.0):
            msg1 = f"Potential match found for your reported found {found_item.name} — {match_data['total_score']}% similarity score."
            notif1 = Notification(user_id=found_item.user_id, match_id=match_obj.id, message=msg1)
            db.add(notif1)

            if lost.user_id != found_item.user_id:
                msg2 = f"Potential match found for your lost {lost.name} — {match_data['total_score']}% similarity score."
                notif2 = Notification(user_id=lost.user_id, match_id=match_obj.id, message=msg2)
                db.add(notif2)

            db.commit()


@router.post("/lost", response_model=LostItemResponse)

def report_lost_item(
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    color: str = Form(...),
    brand: Optional[str] = Form(""),
    location: str = Form(...),
    date_lost: str = Form(...),
    additional_details: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = save_uploaded_file(image)
    item = LostItem(
        user_id=current_user.id,
        name=name,
        category=category,
        description=description,
        color=color,
        brand=brand,
        location=location,
        date_lost=date_lost,
        image_url=image_url,
        additional_details=additional_details,
        status="active"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Run AI matching against existing found items
    trigger_matching_for_lost(item, db)

    res = LostItemResponse.from_orm(item)
    res.user_name = current_user.full_name
    return res


@router.post("/found", response_model=FoundItemResponse)

def report_found_item(
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    color: str = Form(...),
    brand: Optional[str] = Form(""),
    location: str = Form(...),
    date_found: str = Form(...),
    additional_details: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = save_uploaded_file(image)
    item = FoundItem(
        user_id=current_user.id,
        name=name,
        category=category,
        description=description,
        color=color,
        brand=brand,
        location=location,
        date_found=date_found,
        image_url=image_url,
        additional_details=additional_details,
        status="active"
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Run AI matching against existing lost items
    trigger_matching_for_found(item, db)

    res = FoundItemResponse.from_orm(item)
    res.user_name = current_user.full_name
    return res


@router.get("/lost", response_model=List[LostItemResponse])
def get_lost_items(
    category: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query("active"),
    db: Session = Depends(get_db)
):
    query = db.query(LostItem)
    if status and status != "all":
        query = query.filter(LostItem.status == status)
    if category:
        query = query.filter(LostItem.category.ilike(f"%{category}%"))
    if color:
        query = query.filter(LostItem.color.ilike(f"%{color}%"))
    if location:
        query = query.filter(LostItem.location.ilike(f"%{location}%"))
    
    items = query.order_by(LostItem.created_at.desc()).all()
    results = []
    for item in items:
        res = LostItemResponse.from_orm(item)
        res.user_name = item.user.full_name if item.user else "Unknown"
        results.append(res)
    return results


@router.get("/found", response_model=List[FoundItemResponse])
def get_found_items(
    category: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query("active"),
    db: Session = Depends(get_db)
):
    query = db.query(FoundItem)
    if status and status != "all":
        query = query.filter(FoundItem.status == status)
    if category:
        query = query.filter(FoundItem.category.ilike(f"%{category}%"))
    if color:
        query = query.filter(FoundItem.color.ilike(f"%{color}%"))
    if location:
        query = query.filter(FoundItem.location.ilike(f"%{location}%"))
    
    items = query.order_by(FoundItem.created_at.desc()).all()
    results = []
    for item in items:
        res = FoundItemResponse.from_orm(item)
        res.user_name = item.user.full_name if item.user else "Unknown"
        results.append(res)
    return results


@router.get("/my-reports")
def get_my_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lost = db.query(LostItem).filter(LostItem.user_id == current_user.id).order_by(LostItem.created_at.desc()).all()
    found = db.query(FoundItem).filter(FoundItem.user_id == current_user.id).order_by(FoundItem.created_at.desc()).all()

    lost_list = []
    for item in lost:
        res = LostItemResponse.from_orm(item)
        res.user_name = current_user.full_name
        lost_list.append(res)

    found_list = []
    for item in found:
        res = FoundItemResponse.from_orm(item)
        res.user_name = current_user.full_name
        found_list.append(res)

    return {
        "lost_items": lost_list,
        "found_items": found_list
    }
