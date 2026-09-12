import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.models import User, LostItem, FoundItem, Match
from backend.schemas.schemas import AdminStatsResponse, MatchResponse, LostItemResponse, FoundItemResponse, MatchStatusUpdate
from backend.services.auth_service import get_current_admin
from backend.api.matches import format_match_response

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_lost = db.query(LostItem).count()
    total_found = db.query(FoundItem).count()
    potential_matches = db.query(Match).filter(Match.status == "potential", Match.total_score >= 70.0).count()
    confirmed_matches = db.query(Match).filter(Match.status == "confirmed").count()
    returned_items = db.query(Match).filter(Match.status == "returned").count() + \
                     db.query(LostItem).filter(LostItem.status == "returned").count()

    return AdminStatsResponse(
        total_lost_reports=total_lost,
        total_found_reports=total_found,
        potential_matches=potential_matches,
        confirmed_matches=confirmed_matches,
        returned_items=returned_items
    )


@router.get("/matches", response_model=List[MatchResponse])
def get_all_matches(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    matches = db.query(Match).order_by(Match.total_score.desc()).all()
    return [format_match_response(m) for m in matches]


@router.put("/matches/{match_id}/status", response_model=MatchResponse)
def admin_update_match_status(
    match_id: int,
    status_update: MatchStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

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


@router.delete("/lost/{item_id}")
def delete_lost_item(item_id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    item = db.query(LostItem).filter(LostItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lost item not found")
    db.delete(item)
    db.commit()
    return {"message": "Lost report removed successfully"}


@router.delete("/found/{item_id}")
def delete_found_item(item_id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    item = db.query(FoundItem).filter(FoundItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Found item not found")
    db.delete(item)
    db.commit()
    return {"message": "Found report removed successfully"}
