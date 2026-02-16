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
    last_name = Column(String)
    dob = Column(String)
    mobile = Column(String)
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

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
