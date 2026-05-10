import uuid
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import get_settings

settings = get_settings()

MIME_TO_EXT = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "application/pdf": ["pdf"],
    "image/svg+xml": ["svg"],
}


async def save_upload(file: UploadFile) -> str:
    content = await file.read()
    _validate_size(content)
    ext = _validate_extension(file.filename or "")
    _validate_mime(content, ext)
    await _scan_virus(content)

    upload_dir = Path(settings.UPLOADS_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4()}.{ext}"
    dest = upload_dir / filename
    dest.write_bytes(content)
    return str(dest)


def _validate_size(content: bytes):
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB")


def _validate_extension(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in settings.allowed_extensions_list:
        raise HTTPException(status_code=415, detail=f"File type .{ext} not allowed")
    return ext


def _validate_mime(content: bytes, ext: str):
    # Basic magic byte checks without external dependencies
    mime = _detect_mime(content)
    allowed = MIME_TO_EXT.get(mime, [])
    if ext not in allowed and mime is not None:
        raise HTTPException(status_code=415, detail="File content does not match its extension")


def _detect_mime(content: bytes) -> str | None:
    if content[:4] == b"%PDF":
        return "application/pdf"
    if content[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if content[:2] in (b"\xff\xd8",):
        return "image/jpeg"
    if b"<svg" in content[:256] or b"<?xml" in content[:64]:
        return "image/svg+xml"
    return None


async def _scan_virus(content: bytes):
    if not settings.CLAMAV_ENABLED:
        return
    try:
        import clamd
        cd = clamd.ClamdNetworkSocket(host=settings.CLAMAV_HOST, port=settings.CLAMAV_PORT)
        import io
        result = cd.instream(io.BytesIO(content))
        status = result.get("stream", ("OK",))[0]
        if status != "OK":
            raise HTTPException(status_code=400, detail="File failed virus scan")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Virus scan service unavailable")
