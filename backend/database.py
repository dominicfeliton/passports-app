import os
import re
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

_raw_url = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/passports",
)
# Neon / standard Postgres URLs use postgres:// but SQLAlchemy async
# engine requires postgresql+asyncpg:// — adapt automatically.
DATABASE_URL = re.sub(
    r"^postgres(?:\+[a-z]+)?://",
    "postgresql+asyncpg://",
    _raw_url,
)
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        from . import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
