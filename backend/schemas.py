from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

# === Transaction Schemas ===

class TransactionAnalysisRequest(BaseModel):
    # Customer Information
    customer_name: str
    customer_gender: str
    customer_age: int = Field(..., ge=18, le=120)
    customer_job: str
    customer_city: str
    customer_state: str
    customer_city_population: int = Field(..., ge=0)
    customer_latitude: float = Field(..., ge=-90, le=90)
    customer_longitude: float = Field(..., ge=-180, le=180)
    
    # Merchant Information
    merchant_latitude: float = Field(..., ge=-90, le=90)
    merchant_longitude: float = Field(..., ge=-180, le=180)
    merchant_category: str
    merchant_name: Optional[str] = None
    
    # Transaction Details
    amount: float = Field(..., gt=0)
    transaction_datetime: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "customer_name": "John Doe",
                "customer_gender": "M",
                "customer_age": 35,
                "customer_job": "Software Engineer",
                "customer_city": "San Francisco",
                "customer_state": "CA",
                "customer_city_population": 873965,
                "customer_latitude": 37.7749,
                "customer_longitude": -122.4194,
                "merchant_latitude": 37.7751,
                "merchant_longitude": -122.4193,
                "merchant_category": "Groceries",
                "amount": 85.50,
                "transaction_datetime": "2024-01-15T14:30:00"
            }
        }

class RiskFactor(BaseModel):
    factor: str
    severity: str  # low, medium, high
    description: str

class TransactionAnalysisResponse(BaseModel):
    transaction_id: str
    fraud_status: str  # legitimate, suspicious, fraudulent
    fraud_probability: float = Field(..., ge=0, le=1)
    confidence_score: float = Field(..., ge=0, le=1)
    risk_factors: List[RiskFactor]
    recommended_action: str  # approve, review, block
    analysis_timestamp: datetime
    model_version: str

class TransactionDetailResponse(BaseModel):
    id: int
    transaction_id: str
    customer_name: str
    amount: float
    fraud_status: str
    fraud_probability: float
    merchant_category: str
    transaction_datetime: datetime
    created_at: datetime
    notes: Optional[str]
    
    class Config:
        from_attributes = True

# === Alert Schemas ===

class AlertResponse(BaseModel):
    id: int
    transaction_id: int
    alert_type: str
    priority: str
    message: str
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    is_resolved: bool
    resolution_notes: Optional[str] = None

# === Batch Processing Schemas ===

class BatchJobRequest(BaseModel):
    file_name: str
    total_records: int

class BatchJobResponse(BaseModel):
    job_id: str
    status: str
    progress_percentage: float
    processed_records: int
    total_records: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BatchJobResultResponse(BaseModel):
    job_id: str
    status: str
    total_records: int
    processed_records: int
    failed_records: int
    fraud_detected_count: int
    legitimate_count: int
    avg_fraud_probability: float
    completed_at: Optional[datetime]
    results_file_url: Optional[str]

# === Dashboard Schemas ===

class DashboardStatsResponse(BaseModel):
    total_transactions: int
    fraud_detected: int
    fraudulent_amount: float
    legitimate_amount: float
    average_fraud_probability: float
    detection_rate: float  # percentage
    high_risk_alerts: int
    pending_reviews: int

class TrendDataPoint(BaseModel):
    timestamp: datetime
    value: float
    label: str

class DashboardTrendsResponse(BaseModel):
    fraud_trend: List[TrendDataPoint]
    volume_trend: List[TrendDataPoint]
    average_risk_score_trend: List[TrendDataPoint]

class CategoryRiskResponse(BaseModel):
    category: str
    fraud_count: int
    total_count: int
    fraud_rate: float
    average_risk_score: float

class RiskByGeographyResponse(BaseModel):
    state: str
    fraud_count: int
    total_count: int
    fraud_rate: float

# === Audit Logs ===

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource_type: str
    resource_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# === User/Auth ===

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    department: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# === Error Response ===

class ErrorResponse(BaseModel):
    detail: str
    error_code: str
    timestamp: datetime
