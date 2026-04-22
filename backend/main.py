from fastapi import FastAPI, Depends, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging
import uuid
import json

from config import get_settings
from database import Base, engine, get_db
from schemas import (
    TransactionAnalysisRequest, TransactionAnalysisResponse, 
    RiskFactor, DashboardStatsResponse, TrendDataPoint
)
from fraud_model import get_fraud_model
import models

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
settings = get_settings()
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Enterprise Fraud Detection API for Financial Institutions"
)

# Create database tables
Base.metadata.create_all(bind=engine)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MIDDLEWARE ====================

@app.middleware("http")
async def add_audit_logging(request: Request, call_next):
    """Middleware to log all requests for audit trail"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    response = await call_next(request)
    
    # Log request details (in production, store in database)
    logger.info(f"[{request_id}] {request.method} {request.url.path} - {response.status_code}")
    
    return response

# ==================== AUTH MIDDLEWARE ====================

async def verify_sso_token(authorization: str = Header(None)) -> dict:
    """
    Verify SSO token from request header.
    In production, this would validate against your SSO provider (Okta, Azure AD, etc.)
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        # In production: Validate token with SSO provider
        # For now, just pass through with mock user
        return {
            "user_id": 1,
            "email": "analyst@bank.com",
            "role": "analyst",
            "sso_id": "sso_12345"
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

# ==================== HEALTH CHECK ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.API_VERSION
    }

# ==================== TRANSACTION ANALYSIS ====================

@app.post("/api/v1/transactions/analyze", response_model=TransactionAnalysisResponse)
async def analyze_transaction(
    request: TransactionAnalysisRequest,
    db: Session = Depends(get_db),
    current_user = Depends(verify_sso_token)
):
    """
    Analyze a single transaction for fraud risk.
    Requires authentication via SSO bearer token.
    """
    try:
        # Get fraud detection model
        model = get_fraud_model()
        
        # Prepare transaction data
        transaction_hour = request.transaction_datetime.hour
        transaction_data = {
            'amount': request.amount,
            'customer_age': request.customer_age,
            'customer_city_population': request.customer_city_population,
            'transaction_hour': transaction_hour,
            'customer_latitude': request.customer_latitude,
            'customer_longitude': request.customer_longitude,
            'merchant_latitude': request.merchant_latitude,
            'merchant_longitude': request.merchant_longitude,
            'merchant_category': request.merchant_category,
            'customer_gender': request.customer_gender,
            'customer_state': request.customer_state,
        }
        
        # Analyze with model
        analysis = model.analyze_transaction(transaction_data)
        
        # Create transaction record in database
        transaction_id = str(uuid.uuid4())
        db_transaction = models.Transaction(
            transaction_id=transaction_id,
            analyst_id=current_user["user_id"],
            customer_name=request.customer_name,
            customer_gender=request.customer_gender,
            customer_age=request.customer_age,
            customer_job=request.customer_job,
            customer_latitude=request.customer_latitude,
            customer_longitude=request.customer_longitude,
            customer_city=request.customer_city,
            customer_state=request.customer_state,
            customer_city_population=request.customer_city_population,
            merchant_latitude=request.merchant_latitude,
            merchant_longitude=request.merchant_longitude,
            merchant_category=request.merchant_category,
            merchant_name=request.merchant_name,
            amount=request.amount,
            transaction_datetime=request.transaction_datetime,
            transaction_hour=transaction_hour,
            fraud_status=analysis['fraud_status'],
            fraud_probability=analysis['fraud_probability'],
            risk_factors=[rf.dict() for rf in [
                RiskFactor(**rf) for rf in analysis['risk_factors']
            ]],
            model_version=analysis['model_version'],
        )
        
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        
        # Log to audit trail
        audit_log = models.AuditLog(
            transaction_id=db_transaction.id,
            user_id=current_user["user_id"],
            action="analyzed",
            resource_type="transaction",
            resource_id=transaction_id,
        )
        db.add(audit_log)
        db.commit()
        
        # Create alert if suspicious
        if analysis['fraud_status'] in ['suspicious', 'fraudulent']:
            alert = models.Alert(
                transaction_id=db_transaction.id,
                alert_type=f"high_fraud_probability",
                priority="high" if analysis['fraud_status'] == 'fraudulent' else 'medium',
                message=f"Transaction flagged with {analysis['fraud_probability']:.1%} fraud probability",
            )
            db.add(alert)
            db.commit()
        
        # Build response
        risk_factors_response = [
            RiskFactor(**rf) for rf in analysis['risk_factors']
        ]
        
        return TransactionAnalysisResponse(
            transaction_id=transaction_id,
            fraud_status=analysis['fraud_status'],
            fraud_probability=analysis['fraud_probability'],
            confidence_score=analysis['confidence_score'],
            risk_factors=risk_factors_response,
            recommended_action='block' if analysis['fraud_status'] == 'fraudulent' else 'review' if analysis['fraud_status'] == 'suspicious' else 'approve',
            analysis_timestamp=datetime.utcnow(),
            model_version=analysis['model_version']
        )
    
    except Exception as e:
        logger.error(f"Error analyzing transaction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ==================== DASHBOARD ====================

@app.get("/api/v1/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(verify_sso_token),
    days: int = 7
):
    """Get dashboard statistics for the past N days"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Query transactions
        transactions = db.query(models.Transaction).filter(
            models.Transaction.created_at >= cutoff_date
        ).all()
        
        total = len(transactions)
        fraud_transactions = [t for t in transactions if t.fraud_status == 'fraudulent']
        fraud_detected = len(fraud_transactions)
        
        # Calculate amounts
        fraudulent_amount = sum(t.amount for t in fraud_transactions)
        legitimate_amount = sum(t.amount for t in transactions if t.fraud_status == 'legitimate')
        
        # Get average fraud probability
        avg_fraud_prob = sum(t.fraud_probability for t in transactions) / total if total > 0 else 0
        
        # Get alerts
        alerts = db.query(models.Alert).filter(
            models.Alert.created_at >= cutoff_date
        ).all()
        
        high_risk = len([a for a in alerts if a.priority == 'high' or a.priority == 'critical'])
        pending_reviews = len([a for a in alerts if not a.is_resolved])
        
        return DashboardStatsResponse(
            total_transactions=total,
            fraud_detected=fraud_detected,
            fraudulent_amount=fraudulent_amount,
            legitimate_amount=legitimate_amount,
            average_fraud_probability=avg_fraud_prob,
            detection_rate=(fraud_detected / total * 100) if total > 0 else 0,
            high_risk_alerts=high_risk,
            pending_reviews=pending_reviews
        )
    
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HEALTH & INFO ====================

@app.get("/api/v1/info")
async def get_api_info():
    """Get API information and configuration"""
    return {
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "environment": settings.API_ENVIRONMENT,
        "fraud_model_threshold": settings.MODEL_THRESHOLD,
        "sso_provider": settings.SSO_PROVIDER,
    }

# ==================== ERROR HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": f"HTTP_{exc.status_code}",
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": getattr(request.state, "request_id", None)
        },
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
