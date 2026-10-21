from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.plugin_service import PluginService
from app.models.schemas import (
    PluginCreate,
    PluginUpdate,
    PluginRead,
    PluginDetail,
    PaginatedResponse,
    APIResponse,
    ErrorResponse,
)

router = APIRouter(prefix="/plugins", tags=["plugins"])


@router.get("", response_model=APIResponse[PaginatedResponse[PluginRead]])
async def list_plugins(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_external: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = PluginService(db)
    result = await service.list_plugins(page, page_size, category, search, is_external)
    return APIResponse(data=result)


@router.get("/{plugin_id}", response_model=APIResponse[PluginDetail])
async def get_plugin(plugin_id: int, db: AsyncSession = Depends(get_db)):
    service = PluginService(db)
    plugin = await service.get_plugin(plugin_id)
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return APIResponse(data=plugin)


@router.get("/by-name/{name}", response_model=APIResponse[PluginDetail])
async def get_plugin_by_name(name: str, db: AsyncSession = Depends(get_db)):
    service = PluginService(db)
    plugin = await service.get_plugin_by_name(name)
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return APIResponse(data=plugin)


@router.post("", response_model=APIResponse[PluginRead], status_code=status.HTTP_201_CREATED)
async def create_plugin(plugin_data: PluginCreate, db: AsyncSession = Depends(get_db)):
    service = PluginService(db)
    existing = await service.get_plugin_by_name(plugin_data.name)
    if existing:
        raise HTTPException(status_code=409, detail="Plugin with this name already exists")
    plugin = await service.create_plugin(plugin_data)
    return APIResponse(data=PluginRead(**plugin.__dict__))


@router.put("/{plugin_id}", response_model=APIResponse[PluginRead])
async def update_plugin(plugin_id: int, plugin_data: PluginUpdate, db: AsyncSession = Depends(get_db)):
    service = PluginService(db)
    plugin = await service.update_plugin(plugin_id, plugin_data)
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return APIResponse(data=PluginRead(**plugin.__dict__))


@router.delete("/{plugin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plugin(plugin_id: int, db: AsyncSession = Depends(get_db)):
    service = PluginService(db)
    deleted = await service.delete_plugin(plugin_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return