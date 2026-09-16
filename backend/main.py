import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import UPLOAD_DIR, CORS_ORIGINS
from backend.database.database import engine, Base, check_and_migrate_db
from backend.api import auth, items, matches, notifications, admin

# Create database tables automatically & migrate missing columns
Base.metadata.create_all(bind=engine)
check_and_migrate_db()

app = FastAPI(
    title="AI-Powered Lost & Found Matching System",
    description="College lost-and-found system with multi-modal AI matching engine",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static media files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API endpoints
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(matches.router)
app.include_router(notifications.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "AI-Powered Lost & Found Matching API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)
