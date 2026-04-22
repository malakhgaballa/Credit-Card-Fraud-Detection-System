#!/usr/bin/env python3
"""
Database initialization and migration script.
Creates all tables and initializes with default data.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, User, Alert
from backend.config import get_settings
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize database with schema"""
    settings = get_settings()
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL, echo=False)
    
    # Create all tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if default admin user exists
        admin_user = db.query(User).filter(User.email == "admin@bank.com").first()
        
        if not admin_user:
            logger.info("Creating default admin user...")
            admin_user = User(
                email="admin@bank.com",
                sso_id="sso_admin_001",
                first_name="Admin",
                last_name="User",
                role="admin",
                department="Security",
                bank_code="BANK001",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("Default admin user created")
        
        # Create sample analyst user
        analyst_user = db.query(User).filter(User.email == "analyst@bank.com").first()
        
        if not analyst_user:
            logger.info("Creating sample analyst user...")
            analyst_user = User(
                email="analyst@bank.com",
                sso_id="sso_analyst_001",
                first_name="John",
                last_name="Analyst",
                role="analyst",
                department="Fraud Prevention",
                bank_code="BANK001",
                is_active=True
            )
            db.add(analyst_user)
            db.commit()
            logger.info("Sample analyst user created")
        
        logger.info("Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
