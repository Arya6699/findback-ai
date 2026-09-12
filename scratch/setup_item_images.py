import os
import shutil
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
BRAIN_DIR = r"C:\Users\BATMAN\.gemini\antigravity-ide\brain\36cd932c-c9d0-4623-9c02-6c90eeb87fe8"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mapping generated artifact PNGs to target upload files
generated_map = {
    "wallet_demo_1789195793602.png": ["wallet_lost.png", "wallet_found.png"],
    "macbook_demo_1789195812160.png": ["macbook_lost.png", "macbook_found.png"],
    "keys_demo_1789195833577.png": ["keys_lost.png", "keys_found.png"],
    "flask_demo_1789195851510.png": ["flask_lost.png", "flask_found.png"],
    "glasses_demo_1789195868336.png": ["glasses_lost.png"],
    "calculator_demo_1789195885568.png": ["calculator_lost.png"],
}

print("[Setup Images] Copying AI generated realistic images...")
for artifact_name, targets in generated_map.items():
    src_path = os.path.join(BRAIN_DIR, artifact_name)
    if os.path.exists(src_path):
        for target in targets:
            dst_path = os.path.join(UPLOAD_DIR, target)
            shutil.copy(src_path, dst_path)
            print(f"  Copied {artifact_name} -> {target}")
    else:
        print(f"  Warning: {src_path} not found")

# Use real Nike backpack photo for backpacks
backpack_src = os.path.join(UPLOAD_DIR, "80f9b4f944cb4b97b02455cb2c4bc863.png")
if os.path.exists(backpack_src):
    shutil.copy(backpack_src, os.path.join(UPLOAD_DIR, "backpack_lost.png"))
    shutil.copy(backpack_src, os.path.join(UPLOAD_DIR, "backpack_found.png"))
    print("  Copied real backpack image -> backpack_lost.png, backpack_found.png")

def create_graphic_card(filename, bg_color, title_text, subtitle_text):
    """Creates a sleek product card image for items without AI photos."""
    img = Image.new("RGB", (600, 450), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Outer sleek border
    draw.rectangle([20, 20, 580, 430], outline=(255, 255, 255), width=3)
    draw.rectangle([30, 30, 570, 420], outline=(220, 220, 220), width=1)
    
    # Header badge box
    draw.rectangle([50, 60, 550, 160], fill=(255, 255, 255))
    
    # Text details
    draw.text((70, 80), title_text, fill=(15, 23, 42))
    draw.text((70, 120), subtitle_text, fill=(100, 116, 139))
    
    # Bottom accent icon graphic shape
    draw.ellipse([230, 200, 370, 340], fill=(255, 255, 255), outline=(37, 99, 235), width=4)
    draw.rectangle([270, 240, 330, 300], fill=(37, 99, 235))
    
    dst_path = os.path.join(UPLOAD_DIR, filename)
    img.save(dst_path)
    print(f"  Generated graphic card -> {filename}")

print("[Setup Images] Creating sleek graphics for umbrella, airpods, and watch...")
create_graphic_card("umbrella_found.png", (30, 41, 59), "AUTOMATIC BLACK UMBRELLA", "Found at Campus Central Bus Stop")
create_graphic_card("airpods_found.png", (241, 245, 249), "APPLE AIRPODS PRO CASE", "Found in Student Union Lobby")
create_graphic_card("watch_found.png", (226, 232, 240), "CASIO VINTAGE WATCH", "Found at Outdoor Sports Complex")

print("[Setup Images] Complete!")
