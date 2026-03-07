import os
import requests

HIVE_API_URL = "https://api.thehive.ai/api/v2/task/sync"

def call_hive_detector(image_bytes: bytes) -> tuple[float, float]:
    """
    Calls The Hive AI image detection API.
    Returns (ai_probability_percent, manipulation_probability_percent).
    Returns (0.0, 0.0) on failure to ensure the pipeline doesn't crash.
    """
    api_key = os.getenv("HIVE_AI_API_KEY")
    if not api_key:
        print("[Hive AI] Warning: HIVE_AI_API_KEY not found in environment.")
        return 0.0, 0.0

    headers = {
        "Authorization": f"Token {api_key}",
        "Accept": "application/json"
    }

    files = {
        "image": ("image.jpg", image_bytes, "image/jpeg")
    }

    try:
        response = requests.post(HIVE_API_URL, headers=headers, files=files, timeout=10)
        
        if response.status_code != 200:
            print(f"[Hive AI] Error response {response.status_code}: {response.text}")
            return 0.0, 0.0

        data = response.json()
        
        # Parse Hive response. The exact parsing depends on Hive's classes,
        # but typically we look inside status -> response -> output -> classes.
        # We'll do a robust generic search for 'ai_generated' and 'manipulated' 
        # or 'deepfake' class names for this implementation.
        
        ai_prob = 0.0
        manipulation_prob = 0.0
        
        if "status" in data and data["status"][0].get("response"):
            outputs = data["status"][0]["response"].get("output", [])
            if outputs and len(outputs) > 0:
                classes = outputs[0].get("classes", [])
                
                for c in classes:
                    class_name = c.get("class", "").lower()
                    score = c.get("score", 0.0) * 100.0  # Convert to percent 0-100
                    
                    if any(x in class_name for x in ["ai_generated", "ai", "synthetic"]):
                        ai_prob = max(ai_prob, score)
                    if any(x in class_name for x in ["manipulated", "deepfake", "edited", "photoshopped"]):
                        manipulation_prob = max(manipulation_prob, score)

        print(f"[Hive AI] Success - AI: {ai_prob:.1f}%, Manipulated: {manipulation_prob:.1f}%")
        return ai_prob, manipulation_prob

    except Exception as e:
        print(f"[Hive AI] Exception during API call: {e}")
        return 0.0, 0.0
