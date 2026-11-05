from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from collections.abc import AsyncGenerator

from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def seed_harnesses() -> None:
    """Seed initial harness data if not already present."""
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        from app.models import Harness
        
        # Check if harnesses already exist
        result = await session.execute(select(Harness))
        existing = result.scalars().all()
        if existing:
            return
        
        harnesses = [
            Harness(
                name="claude-code",
                display_name="Claude Code",
                description="Anthropic's Claude Code - AI-powered coding assistant",
                install_method="npm install -g @anthropic-ai/claude-code",
                capabilities={"agents": True, "skills": True, "commands": True},
            ),
            Harness(
                name="codex-cli",
                display_name="Codex CLI",
                description="OpenAI's Codex CLI - AI coding agent for the terminal",
                install_method="npm install -g @openai/codex",
                capabilities={"agents": True, "skills": True, "commands": False},
            ),
            Harness(
                name="cursor",
                display_name="Cursor",
                description="AI-first code editor with built-in AI capabilities",
                install_method="Download from cursor.sh",
                capabilities={"agents": True, "skills": True, "commands": True},
            ),
            Harness(
                name="opencode",
                display_name="OpenCode",
                description="Open-source AI coding assistant",
                install_method="curl -fsSL https://opencode.ai/install | sh",
                capabilities={"agents": True, "skills": True, "commands": True},
            ),
            Harness(
                name="antigravity",
                display_name="Google Antigravity CLI",
                description="Google's experimental AI coding CLI",
                install_method="Download from Google Cloud",
                capabilities={"agents": False, "skills": True, "commands": False},
            ),
            Harness(
                name="copilot",
                display_name="GitHub Copilot",
                description="AI pair programmer from GitHub",
                install_method="npm install -g @githubnext/github-copilot-cli",
                capabilities={"agents": True, "skills": True, "commands": True},
            ),
            Harness(
                name="pi",
                display_name="Pi",
                description="Personal AI from Inflection",
                install_method="Download from pi.ai",
                capabilities={"agents": False, "skills": True, "commands": False},
            ),
        ]
        for h in harnesses:
            session.add(h)
        await session.commit()


async def init_db() -> None:
    # Import models to register them with Base metadata
    from app.models import Plugin, Agent, Skill, Command, Harness
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_harnesses()
