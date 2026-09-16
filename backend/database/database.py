from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.config import DATABASE_URL

from sqlalchemy import inspect, text

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def check_and_migrate_db():
    try:
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("users")]
            with engine.begin() as conn:
                if "google_id" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR"))
                if "avatar_url" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))
                if "phone" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
                if "location" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN location VARCHAR"))
    except Exception as e:
        print(f"[Migration Warning] {e}")

def seed_initial_users_if_empty():
    try:
        from backend.models.models import User
        from backend.services.auth_service import hash_password
        db = SessionLocal()
        user_count = db.query(User).count()
        if user_count == 0:
            print("[AutoSeed] Seeding default demo accounts...")
            admin = User(email="admin@college.edu", password_hash=hash_password("admin123"), full_name="Campus Admin Officer", role="admin")
            alice = User(email="alice@college.edu", password_hash=hash_password("alice123"), full_name="Alice Smith", role="user")
            bob = User(email="bob@college.edu", password_hash=hash_password("bob123"), full_name="Bob Johnson", role="user")
            charlie = User(email="charlie@college.edu", password_hash=hash_password("charlie123"), full_name="Charlie Davis", role="user")
            db.add_all([admin, alice, bob, charlie])
            db.commit()
            print("[AutoSeed] Default demo accounts successfully created!")
        db.close()
    except Exception as e:
        print(f"[AutoSeed Warning] {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
