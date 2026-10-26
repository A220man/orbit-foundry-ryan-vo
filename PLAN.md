# Product development plan

Each round completes one feature or repair. Future items are planned, not implemented claims.

## Current round

plugin-catalog-ui

## Roadmap

### project-skeleton — Project skeleton with FastAPI backend and React frontend

Status: done

Acceptance:
- FastAPI backend starts and serves /api/v1/health endpoint
- React + Vite + TypeScript frontend builds without errors
- Docker compose includes backend, frontend, Keycloak, SQLite volumes
- Backend tests pass (pytest)
- Frontend typecheck (tsc) and build (vite build) pass
- Frontend tests pass (vitest run)

Implementation: `backend/app/main.py`, `backend/app/core/config.py`, `backend/app/core/database.py`, `backend/app/models/__init__.py`, `backend/app/models/schemas.py`, `backend/app/api/health.py`, `backend/app/api/plugins.py`, `backend/app/api/harnesses.py`, `backend/app/services/plugin_service.py`, `frontend/package.json`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/components/Layout.tsx`, `frontend/src/components/PluginList.tsx`, `frontend/src/components/PluginCard.tsx`, `frontend/src/components/PluginDetail.tsx`, `frontend/src/pages/Plugins.tsx`, `frontend/src/pages/Harnesses.tsx`, `frontend/src/pages/Install.tsx`, `frontend/src/api/client.ts`, `frontend/src/api/types.ts`, `frontend/src/api/hooks.ts`, `compose.yaml`, `Dockerfile.backend`, `Dockerfile.frontend`, `backend/Dockerfile`, `frontend/Dockerfile`, `pyproject.toml`, `.github/workflows/ci.yml`, `keycloak/realm-export.json`

Tests: `backend/tests/test_health.py`, `backend/tests/test_plugins.py`, `backend/tests/test_harnesses.py`, `backend/tests/conftest.py`, `frontend/src/__tests__/App.test.tsx`, `frontend/src/__tests__/PluginList.test.tsx`, `frontend/src/__tests__/setup.tsx`

### plugin-catalog-api — Plugin catalog API with CRUD operations

Status: done

Acceptance:
- GET /api/v1/plugins lists plugins with pagination
- GET /api/v1/plugins/{id} returns plugin detail
- POST /api/v1/plugins creates plugin (admin only)
- PUT /api/v1/plugins/{id} updates plugin (admin only)
- DELETE /api/v1/plugins/{id} deletes plugin (admin only)
- SQLite persistence with proper schema

Implementation: `backend/app/api/plugins.py`, `backend/app/services/plugin_service.py`, `backend/app/models/plugin.py`, `backend/app/core/database.py`

Tests: `backend/tests/test_plugins.py`

### plugin-catalog-ui — Plugin catalog UI with search and detail view

Status: planned

Acceptance:
- Plugin list page with search/filter
- Plugin detail page showing agents, skills, commands
- Responsive design with loading/error/empty states
- Typed API client generated from backend routes

Implementation: `frontend/src/api/client.ts`, `frontend/src/components/PluginList.tsx`, `frontend/src/components/PluginDetail.tsx`, `frontend/src/pages/Plugins.tsx`, `frontend/src/pages/PluginDetailPage.tsx`

Tests: `frontend/src/__tests__/PluginList.test.tsx`

### harness-matrix — Harness compatibility matrix and installation guide

Status: planned

Acceptance:
- GET /api/v1/harnesses returns supported harnesses
- Frontend page showing capability matrix
- Installation commands per harness

Implementation: `backend/app/api/harnesses.py`, `backend/app/models/harness.py`, `frontend/src/pages/Harnesses.tsx`

Tests: `backend/tests/test_harnesses.py`

### oidc-auth — OIDC authentication with Keycloak

Status: planned

Acceptance:
- Login/logout flow with PKCE
- Protected routes require authentication
- Role-based access (viewer/admin)
- Demo mode for local development

Implementation: `backend/app/api/auth.py`, `backend/app/core/security.py`, `backend/app/services/auth_service.py`, `frontend/src/auth/AuthProvider.tsx`, `frontend/src/components/LoginButton.tsx`

Tests: `backend/tests/test_auth.py`, `frontend/src/__tests__/AuthProvider.test.tsx`

### skill-installer — Skill installer workflow (gh skill / npx skills)

Status: planned

Acceptance:
- API endpoint to fetch skill installation instructions
- Frontend workflow for selecting harness and installing skill
- Copy-to-clipboard for installation commands

Implementation: `backend/app/api/skills.py`, `backend/app/services/skill_installer.py`, `frontend/src/pages/SkillInstaller.tsx`

Tests: `backend/tests/test_skills.py`

