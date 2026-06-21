"""
database.py — SQLAlchemy Database Engine & Session Factory
===========================================================
Sets up the SQLAlchemy engine and session factory using the DATABASE_URL
from config.py. This is intentionally kept database-agnostic:
  - Development: SQLite (zero-config, file-based)
  - Production: PostgreSQL (just change DATABASE_URL in .env)

The `get_db()` function is a FastAPI dependency that provides a scoped
database session to each request and guarantees cleanup on completion.
"""

import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ── Engine Configuration ───────────────────────────────────────────────────────
# `check_same_thread=False` is required for SQLite to work with FastAPI's
# thread pool. This arg is safe to include only when using SQLite.
_connect_args: dict = (
    {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args,
    # Set echo=True in DEBUG mode to log all SQL statements
    echo=settings.DEBUG,
)

# ── Session Factory ────────────────────────────────────────────────────────────
# autocommit=False: We manage commits explicitly (safer for error handling)
# autoflush=False: Prevents premature flushing before we're ready
SessionLocal: sessionmaker[Session] = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ── Declarative Base ───────────────────────────────────────────────────────────
# All ORM models must inherit from this class for SQLAlchemy to discover them.
class Base(DeclarativeBase):
    pass


# ── FastAPI Dependency ─────────────────────────────────────────────────────────
def get_db():
    """
    Yields a database session for the duration of a single HTTP request.
    The `try/finally` block guarantees the session is closed after the
    request completes — even if an exception occurs.

    Usage in a router:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """
    Creates all SQLAlchemy-mapped tables in the database if they don't exist.
    This is idempotent — safe to call on every startup.

    Note: Models must be imported BEFORE this is called so SQLAlchemy
    has them in its metadata registry.
    """
    # Import models here to register them with Base.metadata
    from models import user, job  # noqa: F401 (imported for side effects)

    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")
