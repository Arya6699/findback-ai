import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.models import User, Match, LostItem, FoundItem
from backend.schemas.schemas import MatchResponse, MatchStatusUpdate, LostItemResponse, FoundItemResponse
from backend.services.auth_service import get_current_user

router = APIRouter(prefix="/api/matches", tags=["Matches"])

def format_match_response(match: Match) -> MatchResponse:
    explanations = json.loads(match.explanations_json) if match.explanations_json else []
    
    lost_res = LostItemResponse.from_orm(match.lost_item) if match.lost_item else None
    if lost_res and match.lost_item and match.lost_item.user:
        lost_res.user_name = match.lost_item.user.full_name

    found_res = FoundItemResponse.from_orm(match.found_item) if match.found_item else None
    if found_res and match.found_item and match.found_item.user:
        found_res.user_name = match.found_item.user.full_name

    return MatchResponse(
        id=match.id,
        lost_item_id=match.lost_item_id,
        found_item_id=match.found_item_id,
        total_score=match.total_score,
        text_score=match.text_score,
        image_score=match.image_score,
        category_score=match.category_score,
        color_score=match.color_score,
        brand_score=match.brand_score,
        location_score=match.location_score,
        date_score=match.date_score,
        explanations=explanations,
        status=match.status,
        created_at=match.created_at,
        lost_item=lost_res,
        found_item=found_res
    )


@router.get("", response_model=List[MatchResponse])
def get_user_matches(
    min_score: float = Query(0.0),
    top: int = Query(20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch matches where the user owns either the lost item or found item
    user_lost_ids = [item.id for item in current_user.lost_items]
    user_found_ids = [item.id for item in current_user.found_items]

    matches = db.query(Match).filter(
        (Match.lost_item_id.in_(user_lost_ids)) | (Match.found_item_id.in_(user_found_ids)),
        Match.total_score >= min_score
    ).order_by(Match.total_score.desc()).limit(top).all()

    return [format_match_response(m) for m in matches]


@router.get("/top/{item_type}/{item_id}", response_model=List[MatchResponse])
def get_top_matches_for_item(
    item_type: str,
    item_id: int,
    limit: int = Query(5),
    db: Session = Depends(get_db)
):
    """Return top 5 AI matches for a specific lost or found item."""
    if item_type.lower() == "lost":
        matches = db.query(Match).filter(Match.lost_item_id == item_id).order_by(Match.total_score.desc()).limit(limit).all()
    elif item_type.lower() == "found":
        matches = db.query(Match).filter(Match.found_item_id == item_id).order_by(Match.total_score.desc()).limit(limit).all()
    else:
        raise HTTPException(status_code=400, detail="Invalid item type. Must be 'lost' or 'found'")
    
    return [format_match_response(m) for m in matches]


@router.get("/{match_id}", response_model=MatchResponse)
def get_match_detail(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return format_match_response(match)


@router.put("/{match_id}/status", response_model=MatchResponse)
def update_match_status(
    match_id: int,
    status_update: MatchStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Check permission (must be owner or admin)
    is_owner = (match.lost_item.user_id == current_user.id or match.found_item.user_id == current_user.id)
    if not is_owner and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update match status")

    match.status = status_update.status
    if status_update.status == "returned":
        match.lost_item.status = "returned"
        match.found_item.status = "returned"
    elif status_update.status == "confirmed":
        match.lost_item.status = "matched"
        match.found_item.status = "matched"

    db.commit()
    db.refresh(match)
    return format_match_response(match)
