import io
from PIL import Image
import torch
from transformers import AutoModelForImageClassification, AutoImageProcessor

MODEL_NAME = "prithivMLmods/AI-Image-Detector"
_model = None
_processor = None

def _load_model_secondary():
    """Load the HuggingFace model once at startup. Cached locally by transformers."""
    global _model, _processor
    if _model is None:
        try:
            print(f"[AI Detector 2] Loading model '{MODEL_NAME}' from cache or HuggingFace Hub...")
            _processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
            _model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
            _model.eval()
            print("[AI Detector 2] Model loaded successfully.")
        except Exception as e:
            print(f"[AI Detector 2] Failed to load model: {e}")
            raise e

def detect_ai_model2(image_bytes: bytes) -> tuple[float, str]:
    """
    Run the secondary local HuggingFace AI image detector.
    Returns (ai_probability 0-100, predicted_label).
    """
    try:
        _load_model_secondary()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        inputs = _processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = _model(**inputs)

        probs = torch.softmax(outputs.logits, dim=-1).squeeze()
        id2label = _model.config.id2label
        print(f"[AI Detector 2] Raw labels available from model: {id2label}")
        print(f"[AI Detector 2] Raw probabilities output: {probs.tolist()}")

        # Find the label index for AI-generated / artificial / fake
        ai_index = next(
            (idx for idx, label in id2label.items()
             if any(w in label.lower() for w in ["artific", "fake", "ai", "generat"])),
            0
        )
        print(f"[AI Detector 2] Selected AI index {ai_index} ({id2label.get(ai_index, 'unknown')})")

        ai_prob_raw = float(probs[ai_index].item())  # 0.0 – 1.0
        predicted_label = id2label.get(int(torch.argmax(probs).item()), "unknown")

        return round(ai_prob_raw * 100, 2), predicted_label

    except Exception as e:
        print(f"[AI Detector 2] Local model inference failed: {e}")
        return 0.0, "unknown"
