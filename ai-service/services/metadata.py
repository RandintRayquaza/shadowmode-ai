import io
import exifread

def extract_metadata(image_bytes: bytes) -> dict:
    result = {
        "camera": None, "datetime": None, "software": None,
        "hasGps": False, "make": None, "model": None, "raw": {}
    }

    try:
        tags = exifread.process_file(io.BytesIO(image_bytes), details=False)
        if not tags: return result

        def _str(k): return str(tags.get(k)).strip() if tags.get(k) else None

        result["make"] = _str("Image Make")
        result["model"] = _str("Image Model")
        
        if result["make"] and result["model"]:
            result["camera"] = f"{result['make']} {result['model']}"
        elif result["model"]:
            result["camera"] = result["model"]

        result["datetime"] = _str("EXIF DateTimeOriginal") or _str("Image DateTime")
        result["software"] = _str("Image Software")
        result["hasGps"] = any(k.startswith("GPS") for k in tags)

        safe_keys = ["Image Make", "Image Model", "Image Software", "Image DateTime", "EXIF DateTimeOriginal", "EXIF Flash", "EXIF FocalLength", "EXIF ISOSpeedRatings", "EXIF ExposureTime"]
        result["raw"] = {k: str(tags[k]) for k in safe_keys if k in tags}
    except Exception as e:
        result["error"] = str(e)

    return result
