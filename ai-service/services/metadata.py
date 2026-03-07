import io
import exifread


def extract_metadata(image_bytes: bytes) -> dict:
    """
    Extract EXIF metadata from image bytes using exifread.
    Returns a dict with normalised keys the backend can use.
    """
    result = {
        "camera": None,
        "datetime": None,
        "software": None,
        "hasGps": False,
        "make": None,
        "model": None,
        "raw": {},
    }

    try:
        tags = exifread.process_file(io.BytesIO(image_bytes), details=False)

        if not tags:
            return result

        def _str(tag_name: str) -> str | None:
            val = tags.get(tag_name)
            return str(val).strip() if val else None

        result["make"] = _str("Image Make")
        result["model"] = _str("Image Model")

        if result["make"] and result["model"]:
            result["camera"] = f"{result['make']} {result['model']}"
        elif result["model"]:
            result["camera"] = result["model"]

        result["datetime"] = _str("EXIF DateTimeOriginal") or _str("Image DateTime")
        result["software"] = _str("Image Software")
        result["hasGps"] = any(k.startswith("GPS") for k in tags)

        # Include a small safe subset of raw tags for debugging
        safe_keys = [
            "Image Make", "Image Model", "Image Software", "Image DateTime",
            "EXIF DateTimeOriginal", "EXIF Flash", "EXIF FocalLength",
            "EXIF ISOSpeedRatings", "EXIF ExposureTime",
        ]
        result["raw"] = {k: str(tags[k]) for k in safe_keys if k in tags}

    except Exception as e:
        result["error"] = str(e)

    return result
