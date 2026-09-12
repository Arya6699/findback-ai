import os
import json
from typing import Optional, List
import numpy as np
from datetime import datetime
from PIL import Image
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Lazy model initialization to prevent slow server startup
ST_MODEL = None
_ST_LOADED = False

def get_st_model():
    global ST_MODEL, _ST_LOADED
    if not _ST_LOADED:
        _ST_LOADED = True
        try:
            from sentence_transformers import SentenceTransformer
            ST_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"[AI Matching] SentenceTransformers not initialized ({e}). Using TF-IDF fallback.")
    return ST_MODEL

VISION_MODEL = None
VISION_TRANSFORM = None
_VISION_LOADED = False

def get_vision_model():
    global VISION_MODEL, VISION_TRANSFORM, _VISION_LOADED
    if not _VISION_LOADED:
        _VISION_LOADED = True
        try:
            import torch
            import torchvision.models as models
            weights = models.MobileNet_V3_Small_Weights.DEFAULT
            mobilenet = models.mobilenet_v3_small(weights=weights)
            mobilenet.eval()
            VISION_MODEL = torch.nn.Sequential(*list(mobilenet.children())[:-1])
            VISION_TRANSFORM = weights.transforms()
        except Exception as e:
            print(f"[AI Matching] PyTorch Vision model not initialized ({e}). Using PIL Color Histogram fallback.")
    return VISION_MODEL, VISION_TRANSFORM


def get_text_embedding(text: str):
    """Compute text embedding vector using SentenceTransformers or TF-IDF representation."""
    if not text.strip():
        return np.zeros((1, 384))
    st_model = get_st_model()
    if st_model is not None:
        try:
            return st_model.encode([text])
        except Exception:
            pass
    return None

def compute_text_similarity(text1: str, text2: str) -> float:
    """Calculate semantic text similarity (0.0 to 1.0)."""
    if not text1.strip() or not text2.strip():
        return 0.0
    
    # Sentence Transformer embedding comparison
    st_model = get_st_model()
    if st_model is not None:
        try:
            emb1 = st_model.encode([text1])
            emb2 = st_model.encode([text2])
            sim = float(cosine_similarity(emb1, emb2)[0][0])
            return max(0.0, min(1.0, sim))
        except Exception:
            pass

    # TF-IDF Fallback
    try:
        vectorizer = TfidfVectorizer().fit([text1, text2])
        tfidf = vectorizer.transform([text1, text2])
        sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
        return max(0.0, min(1.0, sim))
    except Exception:
        # Simple word intersection fallback
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        if not words1 or not words2:
            return 0.0
        jaccard = len(words1.intersection(words2)) / len(words1.union(words2))
        return float(jaccard)


def get_image_embedding(image_path: str):
    """Extract visual embedding using MobileNetV3 or RGB color histogram."""
    if not image_path or not os.path.exists(image_path):
        return None
    
    try:
        img = Image.open(image_path).convert("RGB")
        v_model, v_transform = get_vision_model()
        if v_model is not None and v_transform is not None:
            try:
                import torch
                tensor = v_transform(img).unsqueeze(0)
                with torch.no_grad():
                    features = v_model(tensor)
                    features = torch.nn.functional.adaptive_avg_pool2d(features, (1, 1))
                    features = torch.flatten(features, 1)
                    return features.numpy()
            except Exception:
                pass

        # Color Histogram fallback (normalized 768-dim RGB histogram)
        hist = img.resize((128, 128)).histogram()
        norm_hist = np.array(hist, dtype=np.float32)
        norm = np.linalg.norm(norm_hist)
        if norm > 0:
            norm_hist /= norm
        return norm_hist.reshape(1, -1)
    except Exception as e:
        print(f"[AI Matching] Image feature extraction error: {e}")
        return None



def compute_image_similarity(img_path1: str, img_path2: str) -> Optional[float]:
    """Calculate image similarity using deep visual embeddings or histogram fallback."""
    emb1 = get_image_embedding(img_path1)
    emb2 = get_image_embedding(img_path2)
    if emb1 is None or emb2 is None:
        return None
    try:
        sim = float(cosine_similarity(emb1, emb2)[0][0])
        return max(0.0, min(1.0, sim))
    except Exception:
        return 0.5


def compute_category_similarity(cat1: str, cat2: str) -> float:
    c1, c2 = cat1.strip().lower(), cat2.strip().lower()
    if c1 == c2:
        return 1.0
    if c1 in c2 or c2 in c1:
        return 0.8
    return 0.0


def compute_color_similarity(col1: str, col2: str) -> float:
    c1, c2 = col1.strip().lower(), col2.strip().lower()
    if c1 == c2:
        return 1.0
    synonyms = {
        "black": ["dark", "charcoal", "grey", "gray"],
        "blue": ["navy", "azure", "cyan", "teal"],
        "red": ["maroon", "crimson", "pink", "burgundy"],
        "white": ["silver", "cream", "off-white", "grey"],
        "brown": ["tan", "beige", "khaki", "bronze"],
        "gold": ["yellow", "bronze"]
    }
    if c1 in c2 or c2 in c1:
        return 0.85
    for base, syns in synonyms.items():
        all_words = [base] + syns
        c1_match = any(w in c1 for w in all_words)
        c2_match = any(w in c2 for w in all_words)
        if c1_match and c2_match:
            return 0.75
    return 0.0


def compute_brand_similarity(b1: Optional[str], b2: Optional[str]) -> float:
    if not b1 and not b2:
        return 0.8  # both unspecified
    if not b1 or not b2:
        return 0.5  # one unspecified
    str1, str2 = b1.strip().lower(), b2.strip().lower()
    if str1 == str2:
        return 1.0
    if str1 in str2 or str2 in str1:
        return 0.85
    return 0.0


def compute_location_similarity(loc1: str, loc2: str) -> float:
    l1, l2 = loc1.strip().lower(), loc2.strip().lower()
    if l1 == l2:
        return 1.0
    tokens1 = set(l1.replace(",", " ").split())
    tokens2 = set(l2.replace(",", " ").split())
    overlap = tokens1.intersection(tokens2)
    if overlap:
        return min(1.0, 0.5 + 0.25 * len(overlap))
    return 0.1


def compute_date_similarity(d1_str: str, d2_str: str) -> float:
    try:
        d1 = datetime.strptime(d1_str[:10], "%Y-%m-%d")
        d2 = datetime.strptime(d2_str[:10], "%Y-%m-%d")
        diff_days = abs((d1 - d2).days)
        if diff_days == 0:
            return 1.0
        elif diff_days <= 2:
            return 0.85
        elif diff_days <= 5:
            return 0.65
        elif diff_days <= 10:
            return 0.40
        else:
            return 0.10
    except Exception:
        return 0.5


def calculate_match_score(lost_item, found_item, uploads_dir: str):
    """
    Computes component similarity scores and overall match score (0–100%).
    Redistributes image weight (25%) proportionally if image is missing.
    """
    # Combine name + description for rich text comparison
    lost_text = f"{lost_item.name}. {lost_item.description}. {lost_item.additional_details or ''}"
    found_text = f"{found_item.name}. {found_item.description}. {found_item.additional_details or ''}"
    
    text_sim = compute_text_similarity(lost_text, found_text)
    cat_sim = compute_category_similarity(lost_item.category, found_item.category)
    col_sim = compute_color_similarity(lost_item.color, found_item.color)
    brand_sim = compute_brand_similarity(lost_item.brand, found_item.brand)
    loc_sim = compute_location_similarity(lost_item.location, found_item.location)
    date_sim = compute_date_similarity(lost_item.date_lost, found_item.date_found)

    # Check images
    img_sim = None
    if lost_item.image_url and found_item.image_url:
        path1 = os.path.join(uploads_dir, os.path.basename(lost_item.image_url))
        path2 = os.path.join(uploads_dir, os.path.basename(found_item.image_url))
        img_sim = compute_image_similarity(path1, path2)

    # Initial Weights
    weights = {
        "text": 0.30,
        "image": 0.25,
        "category": 0.15,
        "color": 0.10,
        "brand": 0.10,
        "location": 0.05,
        "date": 0.05,
    }

    scores = {
        "text": text_sim,
        "category": cat_sim,
        "color": col_sim,
        "brand": brand_sim,
        "location": loc_sim,
        "date": date_sim,
    }

    if img_sim is not None:
        scores["image"] = img_sim
    else:
        # Dynamic Weight Redistribution
        # Distribute 0.25 image weight proportionally across available fields
        avail_weight_sum = sum(w for k, w in weights.items() if k != "image")
        redistributed_weights = {}
        for k in scores:
            redistributed_weights[k] = weights[k] / avail_weight_sum
        weights = redistributed_weights

    # Calculate weighted total (0.0 to 1.0) -> scaled to 0-100%
    total_score = sum(scores[k] * weights[k] for k in scores) * 100.0
    total_score = round(min(100.0, max(0.0, total_score)), 1)

    # Generate user-friendly bullet explanations
    explanations = []
    if cat_sim >= 0.8:
        explanations.append("✓ Same category")
    else:
        explanations.append("✗ Different category")

    if text_sim >= 0.65:
        explanations.append("✓ Similar description")
    elif text_sim >= 0.4:
        explanations.append("✓ Partially matching description")

    if col_sim >= 0.8:
        explanations.append("✓ Same color")
    elif col_sim >= 0.6:
        explanations.append("✓ Similar color shade")

    if brand_sim >= 0.8:
        explanations.append("✓ Same brand")

    if loc_sim >= 0.6:
        explanations.append("✓ Similar location")

    if date_sim >= 0.8:
        explanations.append("✓ Similar date")

    if img_sim is not None:
        if img_sim >= 0.7:
            explanations.append("✓ High visual similarity in uploaded photos")
        elif img_sim >= 0.5:
            explanations.append("✓ Moderate visual similarity in uploaded photos")

    return {
        "total_score": total_score,
        "text_score": round(text_sim * 100.0, 1),
        "image_score": round(img_sim * 100.0, 1) if img_sim is not None else None,
        "category_score": round(cat_sim * 100.0, 1),
        "color_score": round(col_sim * 100.0, 1),
        "brand_score": round(brand_sim * 100.0, 1),
        "location_score": round(loc_sim * 100.0, 1),
        "date_score": round(date_sim * 100.0, 1),
        "explanations": explanations
    }
