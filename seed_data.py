import os
import sys
import json
from datetime import datetime, timedelta
from PIL import Image, ImageDraw

# Ensure backend package is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database.database import engine, Base, SessionLocal
from backend.models.models import User, LostItem, FoundItem, Match, Notification
from backend.services.auth_service import hash_password
from backend.ai.matching_engine import calculate_match_score
from backend.config import UPLOAD_DIR, HIGH_MATCH_THRESHOLD

def generate_sample_image(filename: str, color_rgb: tuple, text: str):
    """Creates a realistic colored demo image with text label."""
    img_path = os.path.join(UPLOAD_DIR, filename)
    img = Image.new("RGB", (400, 300), color=color_rgb)
    draw = ImageDraw.Draw(img)
    # Simple visual pattern
    draw.rectangle([50, 50, 350, 250], outline=(255, 255, 255), width=4)
    img.save(img_path)
    return f"/uploads/{filename}"

def seed():
    print("[Seed] Resetting database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("[Seed] Creating sample users...")
    admin = User(email="admin@college.edu", password_hash=hash_password("admin123"), full_name="Campus Admin Officer", role="admin")
    alice = User(email="alice@college.edu", password_hash=hash_password("alice123"), full_name="Alice Smith", role="user")
    bob = User(email="bob@college.edu", password_hash=hash_password("bob123"), full_name="Bob Johnson", role="user")
    charlie = User(email="charlie@college.edu", password_hash=hash_password("charlie123"), full_name="Charlie Davis", role="user")

    db.add_all([admin, alice, bob, charlie])
    db.commit()
    for u in [admin, alice, bob, charlie]:
        db.refresh(u)

    print("[Seed] Assigning demo item images...")
    img_wallet1 = "/uploads/wallet_lost.png"
    img_wallet2 = "/uploads/wallet_found.png"
    img_macbook1 = "/uploads/macbook_lost.png"
    img_macbook2 = "/uploads/macbook_found.png"
    img_backpack1 = "/uploads/backpack_lost.png"
    img_backpack2 = "/uploads/backpack_found.png"
    img_keys1 = "/uploads/keys_lost.png"
    img_keys2 = "/uploads/keys_found.png"
    img_flask1 = "/uploads/flask_lost.png"
    img_flask2 = "/uploads/flask_found.png"
    img_glasses = "/uploads/glasses_lost.png"
    img_calculator = "/uploads/calculator_lost.png"
    img_umbrella = "/uploads/umbrella_found.png"
    img_airpods = "/uploads/airpods_found.png"
    img_watch = "/uploads/watch_found.png"

    today = datetime.now()

    print("[Seed] Creating realistic Lost & Found item reports...")
    
    # Matching pair 1: Silver Keys
    lost_keys = LostItem(
        user_id=alice.id, name="Silver Keychain with 3 Keys & Red Fob", category="Keys",
        description="Set of 3 silver house keys on a ring with a red plastic security access fob.",
        color="Silver", brand="Generic", location="University Gym Locker Room",
        date_lost=(today - timedelta(days=4)).strftime("%Y-%m-%d"), image_url=img_keys1,
        additional_details="Red fob has small logo."
    )
    found_keys = FoundItem(
        user_id=bob.id, name="Keychain with 3 Keys and Red Fob", category="Keys",
        description="Bunch of 3 metallic keys with red electronic key fob found near gym entrance.",
        color="Silver", brand="Generic", location="Gym Entrance Hallway",
        date_found=(today - timedelta(days=3)).strftime("%Y-%m-%d"), image_url=img_keys2,
        additional_details="Found near benches."
    )

    # Unmatched standalone reports
    lost_glasses = LostItem(
        user_id=charlie.id, name="Ray-Ban Black Frame Glasses", category="Clothing & Accessories",
        description="Ray-Ban designer reading glasses with black acetate frames in brown leather case.",
        color="Black", brand="Ray-Ban", location="Chemistry Hall 202",
        date_lost=(today - timedelta(days=5)).strftime("%Y-%m-%d"), image_url=img_glasses
    )
    lost_calculator = LostItem(
        user_id=alice.id, name="Casio Scientific Calculator fx-991EX", category="Electronics",
        description="Casio scientific calculator with name labeled on back sticker.",
        color="Black", brand="Casio", location="Math Dept Lecture Hall 3",
        date_lost=(today - timedelta(days=6)).strftime("%Y-%m-%d"), image_url=img_calculator
    )
    found_umbrella = FoundItem(
        user_id=bob.id, name="Automatic Compact Black Umbrella", category="Others",
        description="Black windproof automatic folding umbrella left in bus stop shelter.",
        color="Black", brand="Totes", location="Campus Central Bus Stop",
        date_found=(today - timedelta(days=2)).strftime("%Y-%m-%d"), image_url=img_umbrella
    )
    found_airpods = FoundItem(
        user_id=alice.id, name="White Apple AirPods Pro Case", category="Electronics",
        description="White wireless charging case for AirPods Pro found in Student Union lobby.",
        color="White", brand="Apple", location="Student Union Lobby",
        date_found=(today - timedelta(days=1)).strftime("%Y-%m-%d"), image_url=img_airpods
    )
    found_watch = FoundItem(
        user_id=charlie.id, name="Silver Casio Vintage Digital Watch", category="Jewelry",
        description="Silver stainless steel digital watch found on tennis court bench.",
        color="Silver", brand="Casio", location="Outdoor Sports Complex",
        date_found=today.strftime("%Y-%m-%d"), image_url=img_watch
    )

    lost_items_all = [lost_keys, lost_glasses, lost_calculator]
    found_items_all = [found_keys, found_umbrella, found_airpods, found_watch]

    db.add_all(lost_items_all)
    db.add_all(found_items_all)
    db.commit()

    for item in lost_items_all + found_items_all:
        db.refresh(item)

    print("[Seed] Running AI matching algorithms for all paired items...")
    
    # Calculate matches for all lost vs found items
    for lost in lost_items_all:
        for found in found_items_all:
            match_data = calculate_match_score(lost, found, UPLOAD_DIR)
            explanations_str = json.dumps(match_data["explanations"])
            
            match_obj = Match(
                lost_item_id=lost.id,
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

            if match_data["total_score"] >= (HIGH_MATCH_THRESHOLD * 100.0):
                msg1 = f"Potential match found for your lost {lost.name} — {match_data['total_score']}% similarity score."
                db.add(Notification(user_id=lost.user_id, match_id=match_obj.id, message=msg1))

                if found.user_id != lost.user_id:
                    msg2 = f"Potential match found for your reported found {found.name} — {match_data['total_score']}% similarity score."
                    db.add(Notification(user_id=found.user_id, match_id=match_obj.id, message=msg2))

                db.commit()

    print("[Seed] Database seeding completed successfully!")
    print(f"       Users: 4")
    print(f"       Lost Reports: {len(lost_items_all)}")
    print(f"       Found Reports: {len(found_items_all)}")

if __name__ == "__main__":
    seed()
