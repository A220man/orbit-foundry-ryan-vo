import pytest
import pytest_asyncio
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
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_test_db():
    """Set up and tear down test database for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    """Create a new database session for each test."""
    async with TestAsyncSessionLocal() as session:
        yield session
        await session.close()


@pytest_asyncio.fixture
async def client(db_session):
    app = create_app(test_engine=test_engine)

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_plugin(db_session):
    plugin = Plugin(
        name="python-development",
        display_name="Python Development",
        description="Python development plugin for AI coding assistants",
        category="development",
        license="MIT",
        repository_url="https://github.com/example/python-development",
        homepage_url="https://github.com/example/python-development",
        is_external=False,
    )
    db_session.add(plugin)
    await db_session.commit()
    await db_session.refresh(plugin)

    # Add an agent
    agent = Agent(
        name="test-agent",
        description="A test agent",
        model_alias="test-model",
        tools=["tool1", "tool2"],
        plugin_id=plugin.id,
    )
    db_session.add(agent)

    # Add a skill
    skill = Skill(
        name="test-skill",
        description="A test skill",
        tags=["tag1", "tag2"],
        plugin_id=plugin.id,
    )
    db_session.add(skill)

    # Add a command
    command = Command(
        name="test-command",
        description="A test command",
        usage="test-command --help",
        plugin_id=plugin.id,
    )
    db_session.add(command)

    await db_session.commit()
    return plugin


@pytest_asyncio.fixture
async def sample_harnesses(db_session):
    harnesses = [
        Harness(
            name="claude-code",
            display_name="Claude Code",
            description="Anthropic's Claude Code",
            install_method="npm install -g @anthropic-ai/claude-code",
            capabilities={"agents": True, "skills": True, "commands": True},
        ),
        Harness(
            name="codex",
            display_name="Codex",
            description="OpenAI's Codex",
            install_method="npm install -g @openai/codex",
            capabilities={"agents": True, "skills": True, "commands": False},
        ),
    ]
    for h in harnesses:
        db_session.add(h)
    await db_session.commit()
    for h in harnesses:
        await db_session.refresh(h)
    return harnesses
