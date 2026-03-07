import os
from dotenv import load_dotenv
import base64
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

from services.ela import run_ela
from services.metadata import extract_metadata
from services.ai_detector import detect_ai_local, _load_model
from services.heuristics import check_heuristics

# Load environment variables from backend/.env
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env")
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app)

# Pre-load the HuggingFace model at startup (cached locally by transformers)
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
        # ── 1. ELA & Metadata (fast, local) ─────────────────────────────────
        print("[AI Service] Running ELA and Metadata extraction...")
        ela_score, ela_heatmap_bytes = run_ela(image_bytes)
        metadata = extract_metadata(image_bytes)

        # ── 2. Local HuggingFace model (umm-maybe/AI-image-detector) ────────
        print("[AI Service] Running AI detection (umm-maybe)...")
        raw_ai_score, ai_label = detect_ai_local(image_bytes)
        print(f"[Debug] Raw AI probability: {raw_ai_score:.1f}%")

        # ── 3. EXIF / forensic signals (display only — do NOT affect ai_score) ────
        has_camera_make  = bool(metadata.get("make"))
        has_camera_model = bool(metadata.get("model"))
        has_datetime     = bool(metadata.get("datetime"))
        has_camera_info  = (has_camera_make or has_camera_model or has_datetime)

        metadata_score = 100
        if not has_camera_make:  metadata_score -= 20
        if not has_camera_model: metadata_score -= 20
        if not has_datetime:     metadata_score -= 30
        metadata_score = max(0, metadata_score)

        raw_compression_score = max(0, int(100 - ela_score))
        compression_score     = min(raw_compression_score, 60)
        noise_score           = max(0, int(100 - (ela_score * 0.5)))

        # ── 4. Verdict — trust the neural model directly ─────────────────────
        # umm-maybe/AI-image-detector was trained specifically for AI vs real.
        # ELA is NOT a reliable gate (AI images can also have clean ELA).
        # Use the neural score as the primary classifier with clear thresholds.
        #
        #   0  – 44  → Authentic Photo
        #  45  – 69  → Possibly Edited
        #  70  – 100 → Likely AI Generated
        ai_score = round(raw_ai_score, 1)
        metadata_risk = float(100 - metadata_score)
        print(f"[Debug] ai_score={ai_score:.1f}%  ELA={ela_score:.1f}  meta_risk={metadata_risk:.0f}")
        print("AI probability:", ai_score)

        # ── 5. Heuristic flags ───────────────────────────────────────────────
        flags = check_heuristics(
            ela_score=ela_score,
            ai_probability=ai_score / 100.0,
            metadata=metadata,
        )

        ela_heatmap_b64 = (base64.b64encode(ela_heatmap_bytes).decode("utf-8")
                           if ela_heatmap_bytes else None)

        # ── 6. Final verdict ─────────────────────────────────────────────────
        if ai_score < 45:
            verdict = "Authentic Photo"
        elif ai_score < 70:
            verdict = "Possibly Edited"
        else:
            verdict = "Likely AI Generated"

        # risk_score for the UI gauge = neural score directly
        risk_score = ai_score

        print(f"[AI Service] FINAL → verdict={verdict}  ai_score={ai_score:.1f}%")

        return jsonify({
            "verdict":   verdict,
            "aiScore":   ai_score,
            "riskScore": risk_score,
            "signals": {
                "neuralScore":        round(ai_score),
                "aiProbability":      round(ai_score),    # backward-compat alias
                "elaScore":           int(ela_score),
                "metadataScore":      metadata_score,
                "metadataIntegrity":  metadata_score,    # backward-compat alias
                "compressionScore":   compression_score,
                "noiseScore":         noise_score,
                "exifPenaltyApplied": has_camera_info,
            },
            "metadata":        metadata,
            "flags":           flags,
            "ela_heatmap_b64": ela_heatmap_b64,
            "ai_label":        ai_label,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
