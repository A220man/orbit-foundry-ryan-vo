from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.database import init_db, engine, Base
from app.api import health, plugins, harnesses
from app.models.schemas import ErrorResponse, APIResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await engine.dispose()


def create_app(test_engine=None) -> FastAPI:
    if test_engine:
        # Use test database
        from app.core.database import Base
        async def test_init_db():
            async with test_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        
        @asynccontextmanager
        async def test_lifespan(app: FastAPI):
            await test_init_db()
            yield
            await test_engine.dispose()
        
        app = FastAPI(
            title=settings.app_name,
            version=settings.app_version,
            debug=settings.debug,
            lifespan=test_lifespan,
        )
    else:
        app = FastAPI(
            title=settings.app_name,
            version=settings.app_version,
            debug=settings.debug,
            lifespan=lifespan,
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=APIResponse(
                success=False,
                data=None,
                error=exc.detail,
                code=f"HTTP_{exc.status_code}"
            ).model_dump(),
        )

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(plugins.router, prefix="/api/v1")
    app.include_router(harnesses.router, prefix="/api/v1")
    return app


app = create_app()