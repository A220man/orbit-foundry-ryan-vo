import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import create_app
from app.core.database import Base, get_db
from app.models import Plugin, Agent, Skill, Command, Harness

# Use file-based database for persistence across connections
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_orbit_foundry.db"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True,
)

TestAsyncSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def override_get_db():
    async with TestAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest.fixture(scope="function", autouse=True)
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    import os
    for f in ["./test_orbit_foundry.db", "./test_orbit_foundry.db-shm", "./test_orbit_foundry.db-wal"]:
        try:
            os.remove(f)
        except OSError:
            pass


@pytest.fixture
async def db_session(setup_test_db):
    """Create a new database session for each test."""
    async with TestAsyncSessionLocal() as session:
        try:
            yield session
            await session.rollback()
        finally:
            await session.close()


@pytest.fixture
async def client(db_session):
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def sample_plugin(db_session):
    plugin = Plugin(
        name="python-development",
        display_name="Python Development",
        description="Python, Django, FastAPI, testing, and packaging",
        category="development",
        repository_url="https://github.com/wshobson/agents",
        license="MIT",
    )
    db_session.add(plugin)
    await db_session.flush()

    agent = Agent(
        plugin_id=plugin.id,
        name="python-expert",
        description="Expert Python developer",
        model_alias="opus",
        tools=["read", "write", "bash", "edit"],
    )
    skill = Skill(
        plugin_id=plugin.id,
        name="python-testing-patterns",
        description="Testing patterns for Python",
        tags=["testing", "pytest"],
    )
    command = Command(
        plugin_id=plugin.id,
        name="python-scaffold",
        description="Create a FastAPI service with tests",
        usage="/python-development:python-scaffold Create a FastAPI service",
    )
    db_session.add_all([agent, skill, command])
    await db_session.flush()
    await db_session.refresh(plugin)

    return plugin


@pytest.fixture
async def sample_harnesses(db_session):
    harnesses = [
        Harness(
            name="claude-code",
            display_name="Claude Code",
            description="Anthropic's CLI coding agent",
            install_method="Plugin marketplace",
            capabilities={"agents": True, "skills": True, "commands": True, "hooks": True, "mcp": True},
        ),
        Harness(
            name="codex-cli",
            display_name="OpenAI Codex CLI",
            description="OpenAI's command-line coding agent",
            install_method="Native marketplace or generated artifacts",
            capabilities={"agents": True, "skills": True, "commands": True, "hooks": False, "mcp": False},
        ),
    ]
    db_session.add_all(harnesses)
    await db_session.flush()
    return harnesses