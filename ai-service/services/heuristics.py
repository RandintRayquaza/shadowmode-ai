"""
Heuristic flag detection for image forensics.

Each flag has:
  name        - short identifier
  severity    - 'high' | 'medium' | 'low'
  description - human-readable explanation
"""

# Software tags commonly associated with editing / AI generation
SUSPICIOUS_SOFTWARE = [
    "adobe photoshop",
    "gimp",
    "stable diffusion",
    "midjourney",
    "dall-e",
    "dall·e",
    "firefly",
    "canva",
    "snapseed",
    "pixlr",
    "lightroom",
    "affinity photo",
    "paint.net",
    "fotor",
]


def check_heuristics(
    ela_score: float,
    ai_probability: float,
    metadata: dict,
) -> list[dict]:
    """
    Analyse combined signals and return a list of flag dicts.

    Parameters
    ----------
    ela_score       : float  0-100
    ai_probability  : float  0.0-1.0
    metadata        : dict   from metadata.extract_metadata()
    """
    flags = []

    # ── AI-related flags ──────────────────────────────────────────────────
    if ai_probability >= 0.85:
        flags.append({
            "name": "HIGH_AI_PROBABILITY",
            "severity": "high",
            "description": f"Image has a {ai_probability*100:.0f}% probability of being AI-generated.",
        })
    elif ai_probability >= 0.55:
        flags.append({
            "name": "ELEVATED_AI_PROBABILITY",
            "severity": "medium",
            "description": f"Image shows elevated AI generation signals ({ai_probability*100:.0f}% probability).",
        })

    # ── ELA flags ─────────────────────────────────────────────────────────
    if ela_score >= 60:
        flags.append({
            "name": "HIGH_ELA_SCORE",
            "severity": "high",
            "description": f"Error Level Analysis detected high pixel inconsistency (score: {ela_score:.1f}/100), suggesting localised editing.",
        })
    elif ela_score >= 35:
        flags.append({
            "name": "ELEVATED_ELA_SCORE",
            "severity": "medium",
            "description": f"Moderate ELA inconsistency detected (score: {ela_score:.1f}/100). Some areas may have been retouched.",
        })

    # ── Metadata flags ────────────────────────────────────────────────────
    if not metadata.get("camera") and not metadata.get("datetime"):
        flags.append({
            "name": "MISSING_EXIF",
            "severity": "medium",
            "description": "No camera or timestamp EXIF data found. Authentic photographs typically contain this information.",
        })
    elif not metadata.get("camera"):
        flags.append({
            "name": "MISSING_CAMERA_DATA",
            "severity": "low",
            "description": "Camera make/model information is absent from the image metadata.",
        })

    # ── Software tag flags ────────────────────────────────────────────────
    software = (metadata.get("software") or "").lower()
    if software:
        matched = next(
            (s for s in SUSPICIOUS_SOFTWARE if s in software), None
        )
        if matched:
            severity = "high" if any(
                ai in matched for ai in ["stable diffusion", "midjourney", "dall"]
            ) else "medium"
            flags.append({
                "name": "EDITING_SOFTWARE_DETECTED",
                "severity": severity,
                "description": f"Image metadata contains a software tag indicating it was processed by '{metadata['software']}'.",
            })

    # ── GPS flags ─────────────────────────────────────────────────────────
    # AI-generated images almost never have GPS data embedded
    if not metadata.get("hasGps") and metadata.get("camera"):
        # Only flag if camera is present but GPS is absent (vs. simply no metadata)
        pass  # This is normal — most cameras don't embed GPS

    return flags
