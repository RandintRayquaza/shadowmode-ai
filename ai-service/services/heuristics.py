SUSPICIOUS_SOFTWARE = [
    "adobe photoshop", "gimp", "stable diffusion", "midjourney", 
    "dall-e", "dall·e", "firefly", "canva", "snapseed", 
    "pixlr", "lightroom", "affinity photo", "paint.net", "fotor"
]

def check_heuristics(ela_score: float, ai_probability: float, metadata: dict) -> list[dict]:
    flags = []

    if ai_probability >= 0.85:
        flags.append({"name": "HIGH_AI_PROBABILITY", "severity": "high", "description": f"AI probability: {ai_probability*100:.0f}%."})
    elif ai_probability >= 0.55:
        flags.append({"name": "ELEVATED_AI_PROBABILITY", "severity": "medium", "description": f"Elevated AI signals: {ai_probability*100:.0f}%."})

    if ela_score >= 60:
        flags.append({"name": "HIGH_ELA_SCORE", "severity": "high", "description": f"High pixel inconsistency (score: {ela_score:.1f}/100)."})
    elif ela_score >= 35:
        flags.append({"name": "ELEVATED_ELA_SCORE", "severity": "medium", "description": f"Moderate inconsistency (score: {ela_score:.1f}/100)."})

    if not metadata.get("camera") and not metadata.get("datetime"):
        flags.append({"name": "MISSING_EXIF", "severity": "medium", "description": "No camera or timestamp EXIF data found."})
    elif not metadata.get("camera"):
        flags.append({"name": "MISSING_CAMERA_DATA", "severity": "low", "description": "Camera make/model absent."})

    software = (metadata.get("software") or "").lower()
    if software:
        matched = next((s for s in SUSPICIOUS_SOFTWARE if s in software), None)
        if matched:
            severity = "high" if any(ai in matched for ai in ["stable diffusion", "midjourney", "dall"]) else "medium"
            flags.append({"name": "EDITING_SOFTWARE_DETECTED", "severity": severity, "description": f"Processed by '{metadata['software']}'."})

    return flags
