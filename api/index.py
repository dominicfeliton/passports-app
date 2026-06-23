"""Vercel serverless entry point for FastAPI backend."""
import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.app import app
    handler = app
except Exception as e:
    # Fallback: return a plain-text error so we can see it in the HTTP response
    from fastapi import FastAPI, Response

    error_app = FastAPI()

    @error_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
    async def catch_all(path: str):
        tb = traceback.format_exc()
        return Response(
            content=f"ImportError: {e}\n\n{tb}",
            status_code=500,
            media_type="text/plain",
        )

    handler = error_app
