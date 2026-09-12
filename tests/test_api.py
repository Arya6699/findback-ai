import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add workspace to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from backend.database.database import get_db, Base
from backend.ai.matching_engine import (
    compute_text_similarity,
    compute_category_similarity,
    compute_color_similarity,
    compute_location_similarity,
    compute_date_similarity,
    calculate_match_score
)

# Shared in-memory SQLite DB for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_text_and_attribute_similarity():
    # Test semantic text similarity
    sim1 = compute_text_similarity("Black Leather Fossil Wallet", "Black Leather Wallet found near library")
    assert sim1 >= 0.4

    # Test category similarity
    cat_sim = compute_category_similarity("Electronics", "electronics")
    assert cat_sim == 1.0

    # Test color similarity
    col_sim = compute_color_similarity("Black", "dark grey")
    assert col_sim > 0.7

    # Test location similarity
    loc_sim = compute_location_similarity("Main Library 2nd Floor", "Library Reading Room")
    assert loc_sim >= 0.5

    # Test date similarity
    date_sim = compute_date_similarity("2026-09-08", "2026-09-07")
    assert date_sim == 0.85


def test_weight_redistribution_missing_image():
    class DummyItem:
        def __init__(self, name, category, description, color, brand, location, date_lost, date_found, image_url, details=""):
            self.name = name
            self.category = category
            self.description = description
            self.color = color
            self.brand = brand
            self.location = location
            self.date_lost = date_lost
            self.date_found = date_found
            self.image_url = image_url
            self.additional_details = details

    lost = DummyItem("Black Leather Wallet", "ID & Cards", "Black genuine leather wallet with cards", "Black", "Fossil", "Library", "2026-09-08", None, None)
    found = DummyItem("Black Leather Wallet", "ID & Cards", "Black genuine leather wallet found", "Black", "Fossil", "Library", None, "2026-09-08", None)

    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
    match_result = calculate_match_score(lost, found, uploads_dir)

    # Missing images -> image score should be None
    assert match_result["image_score"] is None
    # Total score should still be high (>85%)
    assert match_result["total_score"] > 85.0
    # Explanation checkmarks should be present
    assert any("Same category" in exp for exp in match_result["explanations"])
    assert any("Same color" in exp for exp in match_result["explanations"])


def test_user_registration_and_login():
    reg_resp = client.post("/api/auth/register", json={
        "email": "testuser@college.edu",
        "password": "password123",
        "full_name": "Test User",
        "role": "user"
    })
    assert reg_resp.status_code == 200
    token_data = reg_resp.json()
    assert "access_token" in token_data

    login_resp = client.post("/api/auth/login", json={
        "email": "testuser@college.edu",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_report_item_and_match_generation():
    # Register user
    reg = client.post("/api/auth/register", json={
        "email": "reporter@college.edu",
        "password": "password123",
        "full_name": "Reporter",
        "role": "user"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Report Found item first
    found_resp = client.post("/api/items/found", data={
        "name": "Found Apple MacBook Air Silver",
        "category": "Electronics",
        "description": "Found Apple silver laptop in computer lab B workstation",
        "color": "Silver",
        "brand": "Apple",
        "location": "CS Lab B",
        "date_found": "2026-09-08"
    }, headers=headers)
    assert found_resp.status_code == 200

    # Report Lost item second (should trigger match)
    lost_resp = client.post("/api/items/lost", data={
        "name": "Apple MacBook Air 13-inch Silver",
        "category": "Electronics",
        "description": "Lost Apple MacBook Air laptop silver color in CS Lab B",
        "color": "Silver",
        "brand": "Apple",
        "location": "CS Lab B",
        "date_lost": "2026-09-08"
    }, headers=headers)
    assert lost_resp.status_code == 200

    # Fetch AI matches
    match_resp = client.get("/api/matches", headers=headers)
    assert match_resp.status_code == 200
    matches = match_resp.json()
    assert len(matches) > 0
    top_match = matches[0]
    assert top_match["total_score"] >= 80.0

    # Fetch notifications
    notif_resp = client.get("/api/notifications", headers=headers)
    assert notif_resp.status_code == 200
    notifs = notif_resp.json()
    assert len(notifs) > 0


from unittest.mock import patch, MagicMock

def test_production_google_login_flow():
    # Mock Google tokeninfo API response
    mock_tokeninfo = {
        "iss": "https://accounts.google.com",
        "aud": "mock-client-id",
        "sub": "google_sub_1029384756",
        "email": "verified.google.user@college.edu",
        "email_verified": True,
        "name": "Verified Google User"
    }

    class MockResponse:
        status_code = 200
        def json(self):
            return mock_tokeninfo

    class MockAsyncClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
        async def get(self, url):
            return MockResponse()

    with patch("httpx.AsyncClient", return_value=MockAsyncClient()):
        # 1. Sign in new Google user
        resp1 = client.post("/api/auth/google", json={"id_token": "valid_mock_jwt_token"})
        assert resp1.status_code == 200
        data1 = resp1.json()
        assert "access_token" in data1
        assert data1["email"] == "verified.google.user@college.edu"

        # 2. Existing user account linking
        client.post("/api/auth/register", json={
            "email": "existing.student@college.edu",
            "password": "password123",
            "full_name": "Existing Student",
            "role": "user"
        })

        mock_tokeninfo["email"] = "existing.student@college.edu"
        mock_tokeninfo["sub"] = "google_sub_existing_999"

        resp2 = client.post("/api/auth/google", json={"id_token": "valid_mock_jwt_token_2"})
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["email"] == "existing.student@college.edu"


def test_production_google_login_invalid_token():
    class MockErrorResponse:
        status_code = 400
        def json(self):
            return {"error_description": "Invalid Value"}

    class MockAsyncClientError:
        async def __aenter__(self):
            return self
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
        async def get(self, url):
            return MockErrorResponse()

def test_auth_config_endpoint():
    resp = client.get("/api/auth/config")
    assert resp.status_code == 200
    data = resp.json()
    assert "google_client_id" in data
    assert "google_auth_configured" in data



