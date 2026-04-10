"""Aggregate router that mounts every v1 sub-router."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routers import ai, auth, exports, health, payments, resumes, users

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(exports.router, prefix="/exports", tags=["Exports"])
