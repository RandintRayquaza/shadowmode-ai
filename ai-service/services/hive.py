import os
import requests

HIVE_API_URL = "https://api.thehive.ai/api/v3/sync"

def detect_ai_hive(image_bytes: bytes) -> tuple[float, float]:

    secret_key = os.getenv("HIVE_AI_API_KEY") 
    access_key = os.getenv("HIVE_AI_ACCESS_KEY")
    
    if not secret_key or not access_key:
        print("[Hive AI] Warning: Hive v3 keys not found in environment.")
        return None, None

    headers = {
        "Authorization": f"token {secret_key}",
        "Accept": "application/json"
    }

    # v3 payload requires the model key we want to query
    data = {"classes": "ai_generated,manipulated"}

    files = {
        "media": ("image.jpg", image_bytes, "image/jpeg")
    }

    try:
        response = requests.post(HIVE_API_URL, headers=headers, data=data, files=files, timeout=10)

        if response.status_code != 200:
            print(f"[Hive AI] Error response {response.status_code}: {response.text}")
            return None, None

        data = response.json()

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

        print(f"[Hive AI] Success — AI: {ai_prob:.1f}%, Manipulated: {manipulation_prob:.1f}%")
        return ai_prob, manipulation_prob

    except Exception as e:
        print(f"[Hive AI] Exception during API call: {e}")
        return None, None


call_hive_detector = detect_ai_hive
