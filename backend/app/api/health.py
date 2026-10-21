from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import get_settings
from app.models.schemas import HealthResponse, APIResponse

router = APIRouter(tags=["health"])

settings = get_settings()


@router.get("/health", response_model=APIResponse[HealthResponse])
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return APIResponse(data=HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        version=settings.app_version,
    ))