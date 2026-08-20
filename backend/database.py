from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Database Configuration
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if SQLALCHEMY_DATABASE_URL:
    # Render provides postgres://, but SQLAlchemy requires postgresql://
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    DB_PATH = os.path.join(DATA_DIR, "insurance_wizard.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# ORM models live in models.py (kept separate from this engine/session config).
# Importing them here registers them on Base.metadata and re-exports them, so
# existing imports such as `from database import User` keep working unchanged.
# NOTE: models.py does `from database import Base`, so this import MUST come after
# `Base` is defined above (intentional late import to resolve the mutual reference).
from models import (  # noqa: E402
    Organization, User, Recommendation, PortabilityUser, Lead, CorporateLead,
    PRODUCT_MAP, PRODUCT_SUBCATEGORIES,
    CALL_CENTER_STATUSES, DOCUMENT_STATUSES, INSURER_STATUSES, CASE_STATUSES,
    CORPORATE_LEAD_STATUSES, PREFERRED_CONTACT_METHODS,
    PLANNING_FOR_OPTIONS, PLANNING_PRIORITY_OPTIONS, EMPLOYMENT_STATUSES,
    CURRENT_COVER_AMOUNTS, PORTABILITY_REASONS, DEFAULT_STATUSES,
)


# Create tables and auto-migrate missing columns
def init_db():
    Base.metadata.create_all(bind=engine)
    try:
        inspector = inspect(engine)
        with engine.begin() as conn:
            for table_name, table in Base.metadata.tables.items():
                if inspector.has_table(table_name):
                    existing_columns = [c["name"] for c in inspector.get_columns(table_name)]
                    for column in table.columns:
                        if column.name not in existing_columns:
                            col_type = column.type.compile(engine.dialect)
                            default_clause = ""
                            # Generic fallback for defaults
                            if "JSON" in str(col_type):
                                default_clause = " DEFAULT '{}'"
                            elif "BOOLEAN" in str(col_type).upper():
                                default_clause = " DEFAULT FALSE"
                            elif "INTEGER" in str(col_type).upper():
                                default_clause = " DEFAULT 0"
                            elif "DATETIME" in str(col_type).upper():
                                default_clause = ""  # Let it be null

                            alter_stmt = f'ALTER TABLE "{table_name}" ADD COLUMN "{column.name}" {col_type}{default_clause}'
                            print(f"[AUTO-MIGRATE] Running: {alter_stmt}")
                            try:
                                conn.execute(text(alter_stmt))
                            except Exception as e:
                                print(f"[AUTO-MIGRATE] Failed to add {column.name}: {e}")
    except Exception as e:
        print(f"[AUTO-MIGRATE] Auto-migration failed: {e}")

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
