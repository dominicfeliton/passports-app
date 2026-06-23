import os
import re as _re
from urllib.parse import urlencode, parse_qs, urlparse, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

_raw_url = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/passports",
)
_raw_url = _re.sub(
    r"^postgres(?:ql)?(?:\+[a-z]+)?://",
    "postgresql+asyncpg://",
    _raw_url,
)
# Ensure channel_binding=disable is in the query string for asyncpg/Neon compat
_parsed = urlparse(_raw_url)
_qs = parse_qs(_parsed.query)
if "channel_binding" not in _qs:
    _qs["channel_binding"] = ["disable"]
DATABASE_URL = urlunparse(_parsed._replace(query=urlencode(_qs, doseq=True)))


class Base(DeclarativeBase):
    pass


def _make_engine():
    return create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"ssl": "require", "channel_binding": "disable"},
        pool_pre_ping=True,
    )


_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = _make_engine()
    return _engine


def get_sessionmaker():
    return async_sessionmaker(get_engine(), class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with get_sessionmaker() as session:
        yield session


async def init_db():
    engine = get_engine()
    async with engine.begin() as conn:
        from . import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
