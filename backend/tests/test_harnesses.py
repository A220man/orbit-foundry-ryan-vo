import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_harnesses(client: AsyncClient, sample_harnesses):
    response = await client.get("/api/v1/harnesses")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["items"]) == 2
    assert data["data"]["total"] == 2

    names = [h["name"] for h in data["data"]["items"]]
    assert "claude-code" in names
    assert "codex" in names


@pytest.mark.asyncio
async def test_get_harness(client: AsyncClient, sample_harnesses):
    harness = sample_harnesses[0]
    response = await client.get(f"/api/v1/harnesses/{harness.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == harness.id
    assert data["data"]["name"] == "claude-code"
    assert "capabilities" in data["data"]


@pytest.mark.asyncio
async def test_get_harness_not_found(client: AsyncClient):
    response = await client.get("/api/v1/harnesses/999")
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert "not found" in data["error"].lower()