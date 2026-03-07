import io
from PIL import Image
import torch
from transformers import ViTForImageClassification, ViTFeatureExtractor

MODEL_NAME = "umm-maybe/AI-image-detector"

_model = None
_feature_extractor = None


def _load_model():
    global _model, _feature_extractor
    if _model is None:
        _feature_extractor = ViTFeatureExtractor.from_pretrained(MODEL_NAME)
        _model = ViTForImageClassification.from_pretrained(MODEL_NAME)
        _model.eval()


def detect_ai(image_bytes: bytes) -> tuple[float, str]:
    """
    Run the AI-image-detector ViT model on the image.
    Returns (ai_probability, label) where label is 'artificial' or 'human'.
    ai_probability is the probability that the image is AI-generated (0.0–1.0).
    """
    _load_model()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"AI detector: cannot open image — {e}")

    inputs = _feature_extractor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = _model(**inputs)

    logits = outputs.logits
    probs = torch.softmax(logits, dim=-1).squeeze()

    # Model labels: id2label — usually {0: 'artificial', 1: 'human'}
    id2label = _model.config.id2label  # e.g. {0: 'artificial', 1: 'human'}

    # Find the index for 'artificial' / AI-generated
    ai_index = None
    for idx, label in id2label.items():
        if "artific" in label.lower() or "fake" in label.lower() or "ai" in label.lower():
            ai_index = idx
            break

    if ai_index is None:
        # Fallback: assume index 0 is AI-generated
        ai_index = 0

    ai_prob = float(probs[ai_index].item())
    predicted_idx = int(torch.argmax(probs).item())
    predicted_label = id2label.get(predicted_idx, "unknown")

    return ai_prob, predicted_label
