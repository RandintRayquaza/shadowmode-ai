import io
import base64
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

from services.ela import run_ela
from services.metadata import extract_metadata
from services.ai_detector import detect_ai
from services.heuristics import check_heuristics

app = Flask(__name__)
CORS(app)

# Load the AI detector model at startup so first request is not slow
print("⏳  Loading AI image detector model…")
try:
    from services.ai_detector import _load_model
    _load_model()
    print("✅  AI detector model loaded.")
except Exception as e:
    print(f"⚠️  Model pre-load failed (will retry on first request): {e}")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "shadowmode-ai-service"})


@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files["image"]
    image_bytes = file.read()

    if not image_bytes:
        return jsonify({"error": "Uploaded image is empty."}), 400

    try:
        # ── ELA ──────────────────────────────────────────────────────────────
        ela_score, ela_heatmap_bytes = run_ela(image_bytes)

        # ── Metadata ──────────────────────────────────────────────────────────
        metadata = extract_metadata(image_bytes)

        # ── AI Detection ──────────────────────────────────────────────────────
        ai_probability, ai_label = detect_ai(image_bytes)

        # ── Heuristics ────────────────────────────────────────────────────────
        flags = check_heuristics(
            ela_score=ela_score,
            ai_probability=ai_probability,
            metadata=metadata,
        )

        # Encode ELA heatmap as base64 for transport
        ela_heatmap_b64 = (
            base64.b64encode(ela_heatmap_bytes).decode("utf-8")
            if ela_heatmap_bytes
            else None
        )

        return jsonify(
            {
                "ela_score": round(ela_score, 2),
                "ela_heatmap_b64": ela_heatmap_b64,
                "ai_probability": round(float(ai_probability), 4),
                "ai_label": ai_label,
                "metadata": metadata,
                "flags": flags,
            }
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
