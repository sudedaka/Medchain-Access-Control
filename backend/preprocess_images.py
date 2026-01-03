from PIL import Image, ImageDraw
from pathlib import Path
import json
import os

BASE = Path("/app")
ORIGINALS = BASE / "uploads/originals"
REDACTED = BASE / "uploads/redacted"
MEDICAL_JSON = BASE / "data/medical.json"

REDACTED.mkdir(parents=True, exist_ok=True)

def redact_image(src: Path, dst: Path):
    img = Image.open(src).convert("RGB")
    w, h = img.size
    draw = ImageDraw.Draw(img)

  
    box_w = int(w * 0.25)  
    box_h = int(h * 0.12)  

    draw.rectangle(
        (w - box_w, 0, w, box_h),
        fill="black"
    )

    img.save(dst)
    print(f"saved: {dst.name}")

def preprocess():
    with open(MEDICAL_JSON) as f:
        medical = json.load(f)

    for pid, pdata in medical.items():
        for lab in pdata.get("labs", []):
            new_images = []

            for img_path in lab.get("images", []):
                fname = os.path.basename(img_path)
                src = ORIGINALS / fname

                if not src.exists():
                    print("missing:", src)
                    continue

                dst = REDACTED / f"{src.stem}_redacted.jpg"
                redact_image(src, dst)
                new_images.append(f"/uploads/redacted/{dst.name}")

        
            lab["images"] = new_images

    with open(MEDICAL_JSON, "w") as f:
        json.dump(medical, f, indent=2)

    print("DONE")

if __name__ == "__main__":
    preprocess()
