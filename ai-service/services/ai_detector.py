import io
import re
from PIL import Image
import torch
from transformers import AutoModelForImageClassification, AutoImageProcessor

MODEL_NAME = "umm-maybe/AI-image-detector"
_model = None
_processor = None

def _load_model():
    """Load the HuggingFace model once at startup. Cached locally by transformers."""
    global _model, _processor
    if _model is None:
        try:
            print(f"[AI Detector] Loading '{MODEL_NAME}' from cache or HuggingFace Hub...")
            _processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
            _model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
            _model.eval()
            print(f"[AI Detector] Model loaded.")
            print(f"[AI Detector] id2label: {_model.config.id2label}")
        except Exception as e:
            print(f"[AI Detector] Failed to load model: {e}")
            raise e


def _find_ai_index(id2label: dict) -> int:
    """
    Robustly identify the index of the AI/synthetic class.

    Priority order:
      1. Exact whole-word match for "ai"  (handles {0:"AI", 1:"Real"})
      2. Keyword substring match for longer AI-specific terms
      3. If real class found, infer AI as the other class (2-class models)
      4. Hard fallback to index 0 with a warning
    """
    # Whole-word "ai" pattern  (avoids matching "rain", "again", etc.)
    _AI_WORD_RE   = re.compile(r'\bai\b', re.IGNORECASE)

    # Substring keywords – ordered from most specific to least
    _AI_KEYWORDS  = ["artificial", "ai-gen", "ai_gen", "aigenerat",
                     "deepfake", "fake", "generat", "synthetic"]
    _REAL_KEYWORDS = ["real", "human", "authentic", "genuine", "natural", "person"]

    ai_index   = -1
    real_index = -1

    # Pass 1 – whole-word "ai" match
    for idx, label in id2label.items():
        if _AI_WORD_RE.search(label) and ai_index == -1:
            ai_index = int(idx)
            print(f"[AI Detector] AI class found via whole-word 'ai' match: idx={ai_index} label='{label}'")

    # Pass 2 – substring keyword match
    if ai_index == -1:
        for idx, label in id2label.items():
            ll = label.lower()
            if any(kw in ll for kw in _AI_KEYWORDS) and ai_index == -1:
                ai_index = int(idx)
                print(f"[AI Detector] AI class found via keyword match: idx={ai_index} label='{label}'")
            if any(kw in ll for kw in _REAL_KEYWORDS) and real_index == -1:
                real_index = int(idx)

    # Pass 3 – infer from real class (binary models only)
    if ai_index == -1 and real_index != -1 and len(id2label) == 2:
        indices = [int(i) for i in id2label.keys()]
        ai_index = [i for i in indices if i != real_index][0]
        print(f"[AI Detector] AI class inferred from real_index={real_index}: ai_index={ai_index} label='{id2label[ai_index]}'")

    # Pass 4 – hard fallback
    if ai_index == -1:
        ai_index = 0
        print(f"[AI Detector] WARNING: could not detect AI label in {id2label}. Falling back to index 0.")

    return ai_index


def detect_ai_local(image_bytes: bytes) -> tuple[float, str]:
    """
    Run umm-maybe/AI-image-detector.
    Returns (ai_probability 0–100, predicted_label).
    """
    try:
        _load_model()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        inputs = _processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = _model(**inputs)

        id2label = _model.config.id2label

        # Step 3 debug: raw logits
        print(f"[Model] Raw logits: {outputs.logits.tolist()}")

        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]  # shape (num_classes,)

        # Step 1 debug: full label map
        print(f"[Model] Model labels: {id2label}")

        # Step 3 debug: full probability breakdown
        prob_map = {id2label[int(i)]: round(float(p), 4) for i, p in enumerate(probs)}
        print(f"[Model] Probabilities: {prob_map}")

        # Step 2: dynamically find AI class index
        ai_index = _find_ai_index(id2label)

        ai_prob_raw    = float(probs[ai_index].item())          # 0.0–1.0
        predicted_label = id2label.get(int(torch.argmax(probs).item()), "unknown")

        # Step 3 debug: final resolved score
        print(f"[Model] AI score: {round(ai_prob_raw * 100, 2)}%  (index={ai_index}, label='{id2label.get(ai_index, '?')}')")
        print(f"[Model] Predicted label: {predicted_label}")

        return round(ai_prob_raw * 100, 2), predicted_label

    except Exception as e:
        print(f"[AI Detector] Inference failed: {e}")
        return 0.0, "unknown"


# Backward-compatible alias
def detect_ai(image_bytes: bytes) -> tuple[float, str]:
    prob, label = detect_ai_local(image_bytes)
    return prob / 100.0, label
