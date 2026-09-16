import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-lost-and-found-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'lost_and_found.db')}")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Match threshold for notifications (80%)
HIGH_MATCH_THRESHOLD = 0.80

# Application Base URL (for CORS and OAuth redirect verification)
APP_URL = os.getenv("APP_URL", "https://findback-ai-beta.vercel.app")
DEFAULT_CORS_ORIGINS = [
    "https://findback-ai-beta.vercel.app",
    "https://findback-ai.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "")
if CORS_ORIGINS_RAW:
    configured = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]
    CORS_ORIGINS = list(dict.fromkeys(configured + DEFAULT_CORS_ORIGINS))
else:
    CORS_ORIGINS = DEFAULT_CORS_ORIGINS


# Google OAuth 2.0 / OpenID Connect credentials
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
