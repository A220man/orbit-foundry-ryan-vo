from datetime import datetime
from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    error: Optional[str] = None
    meta: Optional[dict] = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class PluginBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    display_name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=50)
    repository_url: Optional[str] = None
    homepage_url: Optional[str] = None
    license: str = "MIT"
    is_external: bool = False
    external_url: Optional[str] = None


class PluginCreate(PluginBase):
    pass


class PluginUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    repository_url: Optional[str] = None
    homepage_url: Optional[str] = None
    license: Optional[str] = None
    is_external: Optional[bool] = None
    external_url: Optional[str] = None


class PluginRead(PluginBase):
    id: int
    agent_count: int = 0
    skill_count: int = 0
    command_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str
    model_alias: Optional[str] = None
    tools: list[str] = []


class AgentRead(AgentBase):
    id: int
    plugin_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str
    tags: list[str] = []


class SkillRead(SkillBase):
    id: int
    plugin_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommandBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str
    usage: Optional[str] = None


class CommandRead(CommandBase):
    id: int
    plugin_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PluginDetail(PluginRead):
    agents: list[AgentRead] = []
    skills: list[SkillRead] = []
    commands: list[CommandRead] = []


class HarnessBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=100)
    description: str
    install_method: str
    capabilities: dict = {}


class HarnessRead(HarnessBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True