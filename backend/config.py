import os

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-lost-and-found-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'lost_and_found.db')}"
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Match threshold for notifications (80%)
HIGH_MATCH_THRESHOLD = 0.80

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Application Base URL (for CORS and OAuth redirect verification)
APP_URL = os.getenv("APP_URL", "http://localhost:5173")

# Google OAuth 2.0 / OpenID Connect credentials
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
