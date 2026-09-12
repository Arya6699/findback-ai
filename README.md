# AI-Powered Lost & Found Matching System

A 4th-year college AI web application that automatically reports, detects, links, and ranks potential matches between lost and found items on campus using multi-modal AI similarity algorithms.

---

## 📌 Problem Statement

Every semester, hundreds of valuable items (wallets, laptops, backpacks, keys, IDs, phones) are misplaced or found across campus buildings. Traditional lost-and-found bulletin boards rely on manual browsing, leading to low recovery rates and unreturned items.

The **AI-Powered Lost & Found Matching System** bridges this gap by providing an automated AI matching engine that evaluates lost and found reports using **semantic text embeddings**, **visual image feature vectors**, and **weighted metadata matching** (category, color, brand, location, date). High-confidence matches automatically generate real-time in-app notifications.

---

## 🎯 Objectives

1. **Automated Matching Engine**: Dynamically calculate multi-modal similarity scores (0–100%) whenever a lost or found report is created.
2. **Dynamic Weight Redistribution**: Gracefully redistribute feature weights if optional images are missing.
3. **Resilient AI Pipeline**: Use lightweight local sentence transformers & PyTorch visual embeddings with immediate TF-IDF and histogram fallbacks.
4. **Transparent Score Audit**: Display explicit breakdown progress bars and human-readable explanation checkmarks (`✓ Same category`, `✓ Similar description`, etc.).
5. **Campus Administration**: Provide an Admin Dashboard to monitor statistics, verify matches, and manage retrieval lifecycle.

---

## ✨ Features

- 🔐 **User Authentication**: Secure Register, Login, JWT authorization, role-based controls (`user` vs `admin`).
- 📝 **Item Reporting**: Report lost or found items with text, attributes, date, location, and optional photo attachment.
- 🧠 **AI Multi-Modal Matching**:
  - Semantic text similarity using `SentenceTransformers` (`all-MiniLM-L6-v2`) with TF-IDF fallback.
  - Deep visual image similarity using PyTorch `MobileNetV3` with RGB histogram fallback.
  - Attribute matching for Category, Color, Brand, Location, and Date.
- ⚖️ **Weighted Scoring Formula**:
  - Text: **30%**
  - Image: **25%** (proportionally redistributed if missing)
  - Category: **15%**
  - Color: **10%**
  - Brand: **10%**
  - Location: **5%**
  - Date: **5%**
- 🔔 **Instant In-App Notifications**: Automatic notifications triggered when match score &ge; 80%.
- 📊 **Admin Dashboard**: System statistics (Total Lost, Total Found, Potential Matches, Confirmed Matches, Returned Items) with status controls.
- 🔍 **Real-time Search & Filter**: Filter by category, color, location, date, and status.

---

## 🏗️ System Architecture

```
[ React + Vite Frontend ]  <--->  [ FastAPI REST Server ]
                                          |
                        +-----------------+-----------------+
                        |                 |                 |
                [ SQLite Engine ]  [ AI Engine ]  [ Upload Storage ]
                 (SQLAlchemy)      (Text+Vision)    (/uploads)
```

---

## 🔬 AI Methodology & Matching Formula

### 1. Semantic Text Similarity
Text embeddings are generated using pre-trained `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors). Cosine similarity measures textual alignment between item descriptions. If torch/transformers are unavailable, TF-IDF vectorization is used as a fallback.

### 2. Image Feature Vectors
Visual features are extracted from uploaded photos using a pre-trained `MobileNetV3` feature extractor. If PyTorch model loading is bypassed, a normalized RGB color histogram is generated via PIL.

### 3. Dynamic Weight Redistribution Algorithm
When an image is not uploaded for one or both items, the 25% image weight is redistributed proportionally among the remaining available features:

$$\text{Weight}_k' = \frac{\text{Weight}_k}{\sum_{\text{available}} \text{Weight}_j}$$

---

## 🛠️ Technologies Used

- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Uvicorn, Pydantic, PyJWT, Passlib (Bcrypt)
- **Database**: SQLite
- **AI & ML**: SentenceTransformers, PyTorch / Torchvision, Scikit-learn, NumPy, Pillow
- **Frontend**: React 18, Vite, Lucide-React, Modern Responsive CSS
- **Testing**: Pytest, HTTPX

---

## 💾 Database Schema

- `users`: `id`, `email`, `password_hash`, `full_name`, `role`, `created_at`
- `lost_items`: `id`, `user_id`, `name`, `category`, `description`, `color`, `brand`, `location`, `date_lost`, `image_url`, `status`, `created_at`
- `found_items`: `id`, `user_id`, `name`, `category`, `description`, `color`, `brand`, `location`, `date_found`, `image_url`, `status`, `created_at`
- `matches`: `id`, `lost_item_id`, `found_item_id`, `total_score`, `text_score`, `image_score`, `category_score`, `color_score`, `brand_score`, `location_score`, `date_score`, `explanations_json`, `status`, `created_at`
- `notifications`: `id`, `user_id`, `match_id`, `message`, `is_read`, `created_at`

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 16+

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Seed Database with Demo Reports
Populates the database with 4 users (1 Admin + 3 Students) and 15 realistic lost & found reports with pre-calculated AI matches:
```bash
python seed_data.py
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 🏃 Running the Application

### Start FastAPI Backend
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Documentation: `http://localhost:8000/docs`

### Start React Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Testing

Run backend unit tests covering authentication, item reporting, AI similarity calculation, missing image fallback, and API endpoints:

```bash
pytest tests/
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin Officer | `admin@college.edu` | `admin123` |
| Student User 1 | `alice@college.edu` | `alice123` |
| Student User 2 | `bob@college.edu` | `bob123` |
| Student User 3 | `charlie@college.edu` | `charlie123` |

---

## 🔮 Future Enhancements

1. **GPS Map Geofencing**: Pin exact campus GPS coordinates for lost/found locations.
2. **Email & Push Notifications**: Send automated SMTP email alerts when matches exceed 90%.
3. **OCR Text Extraction**: Extract text labels from photos (e.g., student names on IDs or laptops).
