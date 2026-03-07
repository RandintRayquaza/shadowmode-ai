import io
import numpy as np
from PIL import Image, ImageChops, ImageEnhance


def run_ela(image_bytes: bytes, quality: int = 95) -> tuple[float, bytes]:
    """
    Perform Error Level Analysis on the image.

    Saves the image at the given JPEG quality, then computes the
    absolute pixel difference between the original and the recompressed
    version.  The mean pixel error is normalised to a 0-100 ELA score.
    Returns (ela_score, heatmap_png_bytes).
    """
    try:
        original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"ELA: cannot open image — {e}")

    # Re-save at lower quality to introduce compression artefacts
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")

    # Pixel-wise difference
    diff = ImageChops.difference(original, recompressed)

    # Enhance for visualisation
    enhancer = ImageEnhance.Brightness(diff)
    heatmap = enhancer.enhance(20)  # amplify differences

    # Score: mean absolute error across all channels, normalised 0-100
    diff_array = np.array(diff, dtype=np.float32)
    raw_score = float(diff_array.mean())          # 0–255
    ela_score = min(100.0, (raw_score / 255.0) * 100.0 * 10)  # scale up

    # Encode heatmap as PNG bytes
    out_buffer = io.BytesIO()
    heatmap.save(out_buffer, format="PNG")
    heatmap_bytes = out_buffer.getvalue()

    return ela_score, heatmap_bytes
