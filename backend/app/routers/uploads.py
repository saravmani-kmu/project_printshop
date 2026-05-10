from fastapi import APIRouter, Depends, UploadFile, File
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.upload_service import save_upload

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    path = await save_upload(file)
    return {"path": path, "ok": True}
