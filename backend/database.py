from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
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

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String) # Keeping in DB for now to avoid migration issues, but will remove from UI
    dob = Column(String)
    mobile = Column(String)
    secondary_phone = Column(String)
    secondary_email = Column(String)
    aadhar_number = Column(String)
    income_level = Column(String)
    city = Column(String)
    gender = Column(String)
    marital_status = Column(String)
    support_parents = Column(Boolean, default=False)
    career_stage = Column(String)
    employment_type = Column(String)
    lifestyle = Column(String)
    smoking_status = Column(String) # Never, Occasionally, Regularly
    family_health_history = Column(JSON) # List of conditions
    company_name = Column(String)
    industry_type = Column(String)
    # Gap Analysis fields (Phase 2)
    has_life_insurance = Column(Boolean, default=False)
    existing_life_cover = Column(String) # Stored as string like "₹50 Lakhs"
    existing_life_cover_val = Column(Integer, default=0)
    has_health_insurance = Column(Boolean, default=False)
    existing_health_cover = Column(String)
    existing_health_cover_val = Column(Integer, default=0)
    health_source = Column(String) # Employer, Personal, Both
    parents_covered = Column(Boolean, default=False)
    parents_health_cover = Column(String) # For parents' specific health cover
    parents_health_cover_val = Column(Integer, default=0)
    # Existing Policy Details
    life_provider = Column(String)
    life_policy_name = Column(String)
    health_provider = Column(String)
    health_policy_name = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # JSON field for dependents structure
    dependents_data = Column(JSON)
    num_children = Column(Integer, default=0)
    is_smoker = Column(Boolean, default=False)
    current_step = Column(Integer, default=1)

    recommendations = relationship("Recommendation", back_populates="user")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    life_cover = Column(String)
    life_cover_val = Column(Integer, default=0)
    health_cover = Column(String)
    health_cover_val = Column(Integer, default=0)
    persona_name = Column(String)
    tagline = Column(String)
    details = Column(String)
    reasoning = Column(String)
    features = Column(JSON)
    icon = Column(String)
    prompt_sent = Column(String) # Store the prompt for debugging
    mode = Column(String) # AI or RULE
    life_recommendations = Column(JSON) # Array of specific life plans (Phase 2)
    health_recommendations = Column(JSON) # Array of specific health plans (Phase 2)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")

from sqlalchemy import text, inspect

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
