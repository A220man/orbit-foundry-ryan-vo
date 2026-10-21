# Changelog

## 1.0.0 — work-in-progress checkpoint

Partial code published for continued development. Known issues: STATUS.md.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-21

### Added
- Initial project skeleton with FastAPI backend and React frontend
- Plugin catalog API with CRUD operations (list, get, create, update, delete)
- Plugin catalog UI with search, filtering, pagination
- Plugin detail view showing agents, skills, commands
- Harness compatibility matrix with 7 supported harnesses
- Installation guide with step-by-step commands per harness
- Skills-only installation support (gh skill, npx skills)
- Docker Compose with backend, frontend, Keycloak, SQLite
- Health check endpoints
- Backend tests (pytest) for health, plugins, harnesses
- Frontend tests (vitest) for PluginList and App components
- OIDC authentication foundation with Keycloak realm export
- Demo mode for local development
- Comprehensive README with architecture diagram
- MIT License

### Infrastructure
- SQLite persistent storage with SQLAlchemy async
- Pydantic v2 schemas with validation
- TypeScript typed API client
- Vite + React 18 + TypeScript frontend
- ESLint + Vitest configuration
- Non-root Docker users
- Healthchecks for all services

## [Unreleased]

### Planned
- OIDC authentication implementation (login/logout, PKCE, role-based access)
- Admin UI for plugin management
- Plugin evaluation scoring integration
- Automated catalog sync from upstream wshobson/agents
- Webhook support for plugin updates
- Rate limiting and API keys
- PostgreSQL support for production
- Backup/restore CLI commands