from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import Harness
from app.models.schemas import HarnessRead, APIResponse, PaginatedResponse

router = APIRouter(prefix="/harnesses", tags=["harnesses"])


@router.get("", response_model=APIResponse[PaginatedResponse[HarnessRead]])
async def list_harnesses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Harness).order_by(Harness.name))
    harnesses = result.scalars().all()
    return APIResponse(data=PaginatedResponse(
        items=[HarnessRead(**h.__dict__) for h in harnesses],
        total=len(harnesses),
        page=1,
        page_size=len(harnesses),
        total_pages=1,
    ))


@router.get("/{harness_id}", response_model=APIResponse[HarnessRead])
async def get_harness(harness_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Harness).where(Harness.id == harness_id))
    harness = result.scalar_one_or_none()
    if not harness:
        raise HTTPException(status_code=404, detail="Harness not found")
    return APIResponse(data=HarnessRead(**harness.__dict__))