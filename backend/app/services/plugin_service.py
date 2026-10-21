from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Plugin, Agent, Skill, Command
from app.models.schemas import PluginCreate, PluginUpdate, PaginatedResponse, PluginRead, PluginDetail


class PluginService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_plugins(
        self,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None,
        is_external: Optional[bool] = None,
    ) -> PaginatedResponse[PluginRead]:
        query = select(Plugin)
        count_query = select(func.count(Plugin.id))

        if category:
            query = query.where(Plugin.category == category)
            count_query = count_query.where(Plugin.category == category)
        if search:
            search_term = f"%{search}%"
            query = query.where(
                (Plugin.name.ilike(search_term)) | (Plugin.display_name.ilike(search_term)) | (Plugin.description.ilike(search_term))
            )
            count_query = count_query.where(
                (Plugin.name.ilike(search_term)) | (Plugin.display_name.ilike(search_term)) | (Plugin.description.ilike(search_term))
            )
        if is_external is not None:
            query = query.where(Plugin.is_external == is_external)
            count_query = count_query.where(Plugin.is_external == is_external)

        query = query.order_by(Plugin.name).offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        plugins = result.scalars().all()

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        items = []
        for plugin in plugins:
            agent_count = await self.db.scalar(select(func.count(Agent.id)).where(Agent.plugin_id == plugin.id)) or 0
            skill_count = await self.db.scalar(select(func.count(Skill.id)).where(Skill.plugin_id == plugin.id)) or 0
            command_count = await self.db.scalar(select(func.count(Command.id)).where(Command.plugin_id == plugin.id)) or 0
            items.append(PluginRead(
                **plugin.__dict__,
                agent_count=agent_count,
                skill_count=skill_count,
                command_count=command_count,
            ))

        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size,
        )

    async def get_plugin(self, plugin_id: int) -> Optional[PluginDetail]:
        result = await self.db.execute(select(Plugin).where(Plugin.id == plugin_id))
        plugin = result.scalar_one_or_none()
        if not plugin:
            return None

        agents_result = await self.db.execute(select(Agent).where(Agent.plugin_id == plugin_id))
        agents = agents_result.scalars().all()

        skills_result = await self.db.execute(select(Skill).where(Skill.plugin_id == plugin_id))
        skills = skills_result.scalars().all()

        commands_result = await self.db.execute(select(Command).where(Command.plugin_id == plugin_id))
        commands = commands_result.scalars().all()

        return PluginDetail(
            **plugin.__dict__,
            agents=[a.__dict__ for a in agents],
            skills=[s.__dict__ for s in skills],
            commands=[c.__dict__ for c in commands],
        )

    async def get_plugin_by_name(self, name: str) -> Optional[PluginDetail]:
        result = await self.db.execute(select(Plugin).where(Plugin.name == name))
        plugin = result.scalar_one_or_none()
        if not plugin:
            return None
        return await self.get_plugin(plugin.id)

    async def create_plugin(self, plugin_data: PluginCreate) -> Plugin:
        plugin = Plugin(**plugin_data.model_dump())
        self.db.add(plugin)
        await self.db.commit()
        await self.db.refresh(plugin)
        return plugin

    async def update_plugin(self, plugin_id: int, plugin_data: PluginUpdate) -> Optional[Plugin]:
        result = await self.db.execute(select(Plugin).where(Plugin.id == plugin_id))
        plugin = result.scalar_one_or_none()
        if not plugin:
            return None

        update_data = plugin_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(plugin, field, value)

        await self.db.commit()
        await self.db.refresh(plugin)
        return plugin

    async def delete_plugin(self, plugin_id: int) -> bool:
        result = await self.db.execute(select(Plugin).where(Plugin.id == plugin_id))
        plugin = result.scalar_one_or_none()
        if not plugin:
            return False

        await self.db.delete(plugin)
        await self.db.commit()
        return True