import os
from dotenv import load_dotenv
import base64
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

from services.ela import run_ela
from services.metadata import extract_metadata
from services.ai_detector import detect_ai, _load_model
from services.heuristics import check_heuristics

from services.hive import call_hive_detector

# Load environment variables from backend/.env
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env")
load_dotenv(dotenv_path)

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
        print("[AI Service] Running local ELA and Metadata extraction...")
        ela_score, ela_heatmap_bytes = run_ela(image_bytes)
        metadata = extract_metadata(image_bytes)
        
        print("[AI Service] Running local huggingface AI detection...")
        ai_prob, ai_label = detect_ai(image_bytes)
        
        print("[AI Service] Running Hive AI integration...")
        hive_ai_prob, hive_manip_prob = call_hive_detector(image_bytes)
        
        flags = check_heuristics(
            ela_score=ela_score,
            ai_probability=ai_prob,
            metadata=metadata,
        )

        ela_heatmap_b64 = base64.b64encode(ela_heatmap_bytes).decode("utf-8") if ela_heatmap_bytes else None

        # Calculate aggregate risk score (100 is best, 0 is worst)
        risk_score = 100.0

        severity_weights = {"high": 20, "medium": 10, "low": 5}
        for flag in flags:
            risk_score -= severity_weights.get(flag.get("severity", "low"), 5)

        risk_score -= (ela_score / 100.0) * 30.0
        risk_score -= ai_prob * 40.0
        risk_score -= (hive_ai_prob / 100.0) * 30.0

        risk_score = max(0, min(100, int(round(risk_score))))

        if risk_score >= 80:
            verdict = "Authentic"
        elif risk_score >= 50:
            verdict = "Possibly Edited"
        elif risk_score >= 20:
            verdict = "Likely Manipulated"
        else:
            verdict = "AI Generated"

        # Calculate dummy heuristic signal percentages for the UI
        metadata_integrity = 100
        if not metadata.get("camera"): metadata_integrity -= 40
        if not metadata.get("datetime"): metadata_integrity -= 40
        metadata_integrity = max(0, metadata_integrity)

        compression_consistency = max(0, int(100 - ela_score - (hive_manip_prob * 0.5)))
        noise_score = max(0, int(100 - (ela_score * 0.5) - (hive_manip_prob * 0.5)))

        print(f"[AI Service] Completed. Score: {risk_score}, Verdict: {verdict}")

        return jsonify({
            "riskScore": risk_score,
            "verdict": verdict,
            "signals": {
                "aiProbability": int(ai_prob * 100),
                "elaScore": int(ela_score),
                "metadataIntegrity": metadata_integrity,
                "compressionConsistency": compression_consistency,
                "noiseScore": noise_score,
                "hiveAiProbability": int(hive_ai_prob)
            },
            # Extras for backend storage
            "metadata": metadata,
            "flags": flags,
            "ela_heatmap_b64": ela_heatmap_b64,
            "ai_label": ai_label
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
