from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.core.logging import get_logger
from app.schemas.common import HealthResponse, ReadinessResponse

router = APIRouter()
logger = get_logger(__name__)

APP_VERSION = "0.1.0"


async def check_database() -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as exc:
        logger.warning("health.database_check_failed", error_type=type(exc).__name__, error=str(exc))
        return False
    return True


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        environment=settings.APP_ENV,
        version=APP_VERSION,
    )


@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check() -> ReadinessResponse:
    """Deep check for orchestrators: verifies database connectivity."""
    db_ok = await check_database()
    if not db_ok:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable.",
        )
    return ReadinessResponse(
        status="ready",
        environment=settings.APP_ENV,
        version=APP_VERSION,
        database=True,
    )
