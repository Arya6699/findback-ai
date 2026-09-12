import os
from PIL import Image, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

print("[Format Images] Normalizing item images to 800x600 landscape canvas...")

for filename in os.listdir(UPLOAD_DIR):
    if not (filename.endswith(".png") or filename.endswith(".jpg") or filename.endswith(".jpeg")):
        continue
    
    filepath = os.path.join(UPLOAD_DIR, filename)
    try:
        with Image.open(filepath) as img:
            img = img.convert("RGB")
            
            # Create standard 800x600 image using fit/cover centered thumbnail
            fitted = ImageOps.fit(img, (800, 600), Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            fitted.save(filepath, "PNG", quality=95)
            print(f"  Formatted {filename} -> 800x600 PNG")
    except Exception as e:
        print(f"  Error formatting {filename}: {e}")

print("[Format Images] Complete!")
