import io
import numpy as np
from PIL import Image, ImageChops, ImageEnhance

def run_ela(image_bytes: bytes, quality: int = 95) -> tuple[float, bytes]:
    try:
        original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"ELA image error: {e}")

    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    diff = ImageChops.difference(original, recompressed)
    heatmap = ImageEnhance.Brightness(diff).enhance(20)

    raw_score = float(np.array(diff, dtype=np.float32).mean())
    ela_score = min(100.0, (raw_score / 255.0) * 1000.0)

    out_buffer = io.BytesIO()
    heatmap.save(out_buffer, format="PNG")
    
    return ela_score, out_buffer.getvalue()
