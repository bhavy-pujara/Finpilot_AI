from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Normalize SQLite database URL so that relative paths resolve to the project root
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///./") or db_url == "sqlite:///finpilot.db":
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    db_file = project_root / "finpilot.db"
    db_url = f"sqlite:///{db_file.as_posix()}"

# Handle SQLite vs PostgreSQL connect arguments
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
