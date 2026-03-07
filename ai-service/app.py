import os
from dotenv import load_dotenv
import base64
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

from services.ela import run_ela
from services.metadata import extract_metadata
from services.ai_detector import detect_ai_local, _load_model
from services.ai_detector_secondary import detect_ai_model2, _load_model_secondary
from services.heuristics import check_heuristics

# Load environment variables from backend/.env
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env")
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app)

# Pre-load the HuggingFace model at startup (cached locally by transformers)
try:
    _load_model()
    _load_model_secondary()
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
        # --- 1. ELA & Metadata (fast, local) ---
        print("[AI Service] Running ELA and Metadata extraction...")
        ela_score, ela_heatmap_bytes = run_ela(image_bytes)
        metadata = extract_metadata(image_bytes)

        # --- 2. Local HuggingFace model 1 ---
        print("[AI Service] Running local HuggingFace AI detection (Model 1)...")
        score1, ai_label = detect_ai_local(image_bytes)

        # --- 3. Local HuggingFace model 2 ---
        print("[AI Service] Running local HuggingFace AI detection (Model 2)...")
        score2, ai_label2 = detect_ai_model2(image_bytes)

        # --- 4. Combined AI probability score (0–100) ---
        combined_ai_prob = (score1 + score2) / 2.0
        print(f"[AI Service] Combined score (Model1 + Model2): {combined_ai_prob:.1f}%")

        # --- 5. Heuristic flags ---
        flags = check_heuristics(
            ela_score=ela_score,
            ai_probability=combined_ai_prob / 100.0,  # heuristics expect 0.0–1.0
            metadata=metadata,
        )

        ela_heatmap_b64 = base64.b64encode(ela_heatmap_bytes).decode("utf-8") if ela_heatmap_bytes else None

        # --- 6. Derived heuristic signal percentages ---
        metadata_score = 100
        if not metadata.get("camera"):
            metadata_score -= 40
        if not metadata.get("datetime"):
            metadata_score -= 40
        metadata_score = max(0, metadata_score)

        compression_score = max(0, int(100 - ela_score))
        noise_score = max(0, int(100 - (ela_score * 0.5)))

        # --- 7. Aggregate risk score (100 = fully authentic, 0 = clearly fake) ---
        # Using weighted ensemble of both models and heuristics:
        risk_score = (
            0.35 * (100.0 - score1) +
            0.35 * (100.0 - score2) +
            0.10 * (100.0 - ela_score) +
            0.10 * compression_score +
            0.05 * noise_score +
            0.05 * metadata_score
        )

        severity_weights = {"high": 20, "medium": 10, "low": 5}
        for flag in flags:
            risk_score -= severity_weights.get(flag.get("severity", "low"), 5)

        risk_score = max(0, min(100, int(round(risk_score))))

        # --- 8. Verdict ---
        if risk_score >= 80:
            verdict = "Authentic"
        elif risk_score >= 50:
            verdict = "Possibly Edited"
        elif risk_score >= 20:
            verdict = "Likely Manipulated"
        else:
            verdict = "AI Generated"

        print(f"[AI Service] Done. riskScore={risk_score}, verdict={verdict}")

        return jsonify({
            "riskScore": risk_score,
            "verdict": verdict,
            "signals": {
                "localModel1": round(score1, 1),
                "localModel2": round(score2, 1),
                "aiProbability": round(combined_ai_prob),
                "elaScore": int(ela_score),
                "metadataIntegrity": metadata_score,
                "compressionConsistency": compression_score,
                "noiseScore": noise_score,
            },
            # Extra fields for backend storage / UI
            "metadata": metadata,
            "flags": flags,
            "ela_heatmap_b64": ela_heatmap_b64,
            "ai_label": ai_label,
            "ai_label2": ai_label2,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
