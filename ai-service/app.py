import base64
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

from services.ela import run_ela
from services.metadata import extract_metadata
from services.ai_detector import detect_ai, _load_model
from services.heuristics import check_heuristics

app = Flask(__name__)
CORS(app)

try:
    _load_model()
except Exception:
    pass

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "shadowmode-ai-service"})

@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    image_bytes = request.files["image"].read()
    if not image_bytes:
        return jsonify({"error": "Uploaded image is empty."}), 400

    try:
        ela_score, ela_heatmap_bytes = run_ela(image_bytes)
        metadata = extract_metadata(image_bytes)
        ai_prob, ai_label = detect_ai(image_bytes)
        
        flags = check_heuristics(
            ela_score=ela_score,
            ai_probability=ai_prob,
            metadata=metadata,
        )

        ela_heatmap_b64 = base64.b64encode(ela_heatmap_bytes).decode("utf-8") if ela_heatmap_bytes else None

        return jsonify({
            "ela_score": round(ela_score, 2),
            "ela_heatmap_b64": ela_heatmap_b64,
            "ai_probability": round(float(ai_prob), 4),
            "ai_label": ai_label,
            "metadata": metadata,
            "flags": flags,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
