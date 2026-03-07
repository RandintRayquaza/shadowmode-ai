import io
from PIL import Image
import torch
from transformers import ViTForImageClassification, ViTImageProcessor

MODEL_NAME = "umm-maybe/AI-image-detector"
_model = None
_feature_extractor = None

def _load_model():
    global _model, _feature_extractor
    if _model is None:
        _feature_extractor = ViTImageProcessor.from_pretrained(MODEL_NAME)
        _model = ViTForImageClassification.from_pretrained(MODEL_NAME)
        _model.eval()

def detect_ai(image_bytes: bytes) -> tuple[float, str]:
    _load_model()
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"AI detector image error: {e}")

    inputs = _feature_extractor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = _model(**inputs)

    probs = torch.softmax(outputs.logits, dim=-1).squeeze()
    id2label = _model.config.id2label

    ai_index = next((idx for idx, label in id2label.items() if any(word in label.lower() for word in ["artific", "fake", "ai"])), 0)

    ai_prob = float(probs[ai_index].item())
    predicted_label = id2label.get(int(torch.argmax(probs).item()), "unknown")

    return ai_prob, predicted_label
