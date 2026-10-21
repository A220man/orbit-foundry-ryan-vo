import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_plugins_empty(client: AsyncClient):
    response = await client.get("/api/v1/plugins")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["items"] == []
    assert data["data"]["total"] == 0


@pytest.mark.asyncio
async def test_list_plugins_with_data(client: AsyncClient, sample_plugin):
    response = await client.get("/api/v1/plugins")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["items"]) == 1
    assert data["data"]["total"] == 1
    item = data["data"]["items"][0]
    assert item["name"] == "python-development"
    assert item["display_name"] == "Python Development"
    assert item["agent_count"] == 1
    assert item["skill_count"] == 1
    assert item["command_count"] == 1


@pytest.mark.asyncio
async def test_get_plugin_by_id(client: AsyncClient, sample_plugin):
    response = await client.get(f"/api/v1/plugins/{sample_plugin.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == sample_plugin.id
    assert data["data"]["name"] == "python-development"
    assert len(data["data"]["agents"]) == 1
    assert len(data["data"]["skills"]) == 1
    assert len(data["data"]["commands"]) == 1


@pytest.mark.asyncio
async def test_get_plugin_by_name(client: AsyncClient, sample_plugin):
    response = await client.get("/api/v1/plugins/by-name/python-development")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "python-development"


@pytest.mark.asyncio
async def test_get_plugin_not_found(client: AsyncClient):
    response = await client.get("/api/v1/plugins/999")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert "not found" in data["error"].lower()


@pytest.mark.asyncio
async def test_create_plugin(client: AsyncClient):
    plugin_data = {
        "name": "new-plugin",
        "display_name": "New Plugin",
        "description": "A new test plugin",
        "category": "testing",
        "license": "MIT",
    }
    response = await client.post("/api/v1/plugins", json=plugin_data)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "new-plugin"
    assert data["data"]["display_name"] == "New Plugin"


@pytest.mark.asyncio
async def test_create_duplicate_plugin(client: AsyncClient, sample_plugin):
    plugin_data = {
        "name": "python-development",
        "display_name": "Python Development",
        "description": "Python development plugin",
        "category": "development",
        "license": "MIT",
    }
    response = await client.post("/api/v1/plugins", json=plugin_data)
    assert response.status_code == 409
    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert "already exists" in data["error"].lower()


@pytest.mark.asyncio
async def test_update_plugin(client: AsyncClient, sample_plugin):
    update_data = {
        "display_name": "Updated Python Development",
        "description": "Updated description",
    }
    response = await client.put(f"/api/v1/plugins/{sample_plugin.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["display_name"] == "Updated Python Development"
    assert data["data"]["description"] == "Updated description"


@pytest.mark.asyncio
async def test_delete_plugin(client: AsyncClient, sample_plugin):
    response = await client.delete(f"/api/v1/plugins/{sample_plugin.id}")
    assert response.status_code == 204

    # Verify it's gone
    response = await client.get(f"/api/v1/plugins/{sample_plugin.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_plugin_pagination(client: AsyncClient, db_session):
    from app.models import Plugin, Agent, Skill, Command

    # Add multiple plugins
    for i in range(5):
        plugin = Plugin(
            name=f"plugin-{i}",
            display_name=f"Plugin {i}",
            description=f"Description {i}",
            category="testing",
        )
        db_session.add(plugin)
    await db_session.commit()

    response = await client.get("/api/v1/plugins?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["total"] >= 5  # at least 5 from this test
    assert data["data"]["page"] == 1
    assert data["data"]["page_size"] == 2


@pytest.mark.asyncio
async def test_plugin_filter_by_category(client: AsyncClient, db_session):
    from app.models import Plugin

    plugin = Plugin(
        name="security-plugin",
        display_name="Security Plugin",
        description="Security scanning plugin",
        category="security",
    )
    db_session.add(plugin)
    await db_session.commit()

    response = await client.get("/api/v1/plugins?category=security")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["items"]) == 1
    assert data["data"]["items"][0]["category"] == "security"


@pytest.mark.asyncio
async def test_plugin_search(client: AsyncClient, db_session):
    from app.models import Plugin

    plugin = Plugin(
        name="django-tools",
        display_name="Django Tools",
        description="Django development utilities",
        category="development",
    )
    db_session.add(plugin)
    await db_session.commit()

    response = await client.get("/api/v1/plugins?search=django")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 1
    assert "django" in data["data"]["items"][0]["name"].lower()