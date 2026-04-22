from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey, Enum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

Base = declarative_base()

class TransactionStatusEnum(str, enum.Enum):
    ANALYZED = "analyzed"
    PENDING = "pending"
    ERROR = "error"

class FraudStatusEnum(str, enum.Enum):
    LEGITIMATE = "legitimate"
    SUSPICIOUS = "suspicious"
    FRAUDULENT = "fraudulent"

class AlertPriorityEnum(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    sso_id = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(String, default="viewer")  # admin, analyst, viewer
    department = Column(String)
    bank_code = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    transactions = relationship("Transaction", back_populates="analyst")
    alerts = relationship("Alert", back_populates="assigned_to_user")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    analyst_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Customer Information
    customer_name = Column(String)
    customer_gender = Column(String)
    customer_age = Column(Integer)
    customer_job = Column(String)
    customer_latitude = Column(Float)
    customer_longitude = Column(Float)
    customer_city = Column(String)
    customer_state = Column(String)
    customer_city_population = Column(Integer)
    
    # Merchant Information
    merchant_latitude = Column(Float)
    merchant_longitude = Column(Float)
    merchant_category = Column(String)
    merchant_name = Column(String, nullable=True)
    
    # Transaction Details
    amount = Column(Float)
    transaction_datetime = Column(DateTime)
    transaction_hour = Column(Integer)
    
    # Analysis Results
    fraud_status = Column(Enum(FraudStatusEnum), default=FraudStatusEnum.LEGITIMATE)
    fraud_probability = Column(Float)  # 0-1 confidence score
    risk_factors = Column(JSON)  # List of identified risk factors
    model_version = Column(String)
    
    # Metadata
    is_flagged = Column(Boolean, default=False)
    manual_review_status = Column(String, nullable=True)  # pending, reviewed, resolved
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    analyst = relationship("User", back_populates="transactions")
    alerts = relationship("Alert", back_populates="transaction")
    audit_logs = relationship("AuditLog", back_populates="transaction")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    alert_type = Column(String)  # high_fraud_probability, repeated_merchant, geographic_anomaly, etc.
    priority = Column(Enum(AlertPriorityEnum), default=AlertPriorityEnum.MEDIUM)
    message = Column(String)
    
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    transaction = relationship("Transaction", back_populates="alerts")
    assigned_to_user = relationship("User", back_populates="alerts")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    action = Column(String)  # viewed, modified, flagged, resolved, exported, etc.
    resource_type = Column(String)  # transaction, alert, user, etc.
    resource_id = Column(String)
    
    changes = Column(JSON, nullable=True)  # Before/after values for modifications
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    transaction = relationship("Transaction", back_populates="audit_logs")

class BatchJob(Base):
    __tablename__ = "batch_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    file_name = Column(String)
    total_records = Column(Integer)
    processed_records = Column(Integer, default=0)
    failed_records = Column(Integer, default=0)
    
    status = Column(String, default="pending")  # pending, processing, completed, failed
    progress_percentage = Column(Float, default=0.0)
    
    results_summary = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

class SystemMetric(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, index=True)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # For time-series data retention
    created_at = Column(DateTime, default=datetime.utcnow)
