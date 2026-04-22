# FraudShield Product Specification & Architecture Document

## Executive Summary

FraudShield is a comprehensive, production-ready fraud detection platform built for financial institutions. It transforms the existing machine learning model into a full-featured enterprise product with an intuitive user interface, secure backend infrastructure, real-time analytics, and enterprise-grade security controls.

**Deployment Ready**: The system is designed to be deployed on-premises or in the cloud, integrating with existing banking infrastructure via SSO authentication and REST APIs.

---

## 1. Product Overview

### 1.1 Product Vision
Enable bank employees to detect, investigate, and respond to fraudulent transactions in real-time with a modern, intuitive interface backed by advanced machine learning.

### 1.2 Target Users
- **Bank Fraud Analysts**: Main users performing daily analysis
- **Security Managers**: Monitoring system health and alerts
- **Bank Administrators**: Managing system configuration and user access
- **Integration Managers**: Connecting to third-party banking systems

### 1.3 Core Value Propositions
1. **Speed**: Analyze transactions in real-time (<200ms) to prevent fraud immediately
2. **Accuracy**: 85%+ detection accuracy using proven Random Forest ML model
3. **Ease of Use**: Minimal training required - intuitive web interface
4. **Compliance**: Built-in audit trails, encryption, and compliance controls
5. **Enterprise Ready**: Scalable, secure, and designed for financial institutions

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────────┐              │
│  │   Bank Offices   │◄────────│  Load Balancer/Proxy │              │
│  │  (Multiple)      │         └──────────────────────┘              │
│  └──────────────────┘                   ▲                           │
│           │                             │                           │
│           │                  ┌──────────────────────┐               │
│           │                  │                      │               │
│           └──────────────────┤   HTTPS/TLS 1.3     │               │
│                              │                      │               │
│                              └──────────────────────┘               │
│                                        ▲                            │
│                ┌───────────────────────┼───────────────────────┐   │
│                │                       │                       │   │
│        ┌───────▼────────┐      ┌──────▼───────┐      ┌────────▼──┐│
│        │  Frontend (x3) │      │ Backend (x3) │      │  Workers  ││
│        │  Next.js 16    │      │  FastAPI     │      │ (Celery)  ││
│        │  Port 3000     │      │  Port 8000   │      │           ││
│        └────────────────┘      └──────────────┘      └───────────┘│
│                │                      │                    │        │
│                └──────────┬───────────┴────────┬───────────┘        │
│                           │                    │                    │
│                    ┌──────▼─────────┐  ┌─────▼─────────┐          │
│                    │   PostgreSQL   │  │   Redis       │          │
│                    │   (Primary +   │  │   (Sessions   │          │
│                    │   Replica)     │  │    & Cache)   │          │
│                    └────────────────┘  └───────────────┘          │
│                           │                    │                    │
│                           └────────────────────┘                    │
│                                    │                                 │
│                           ┌────────▼──────────┐                    │
│                           │   Backup Storage  │                    │
│                           │   (S3/GCS)        │                    │
│                           └───────────────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                    ┌─────────────────────┐
                    │   SSO Provider      │
                    │  (Okta/Azure/Key)   │
                    └─────────────────────┘
```

### 2.2 Technology Stack Details

#### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 (no custom CSS files)
- **Data Fetching**: SWR + Fetch API
- **Charts**: Recharts with TypeScript support
- **Icons**: Lucide React
- **State Management**: React Context API (Auth)
- **Build**: Turbopack (default in Next.js 16)

#### Backend
- **Framework**: FastAPI 0.104+
- **Server**: Uvicorn ASGI
- **ORM**: SQLAlchemy 2.0
- **Database Driver**: psycopg2
- **ML Framework**: scikit-learn
- **Data Processing**: Pandas, NumPy
- **Async Tasks**: Celery + Redis
- **Monitoring**: Prometheus client
- **Validation**: Pydantic V2

#### Database
- **Primary**: PostgreSQL 14+ (ACID compliance required)
- **Cache**: Redis 6+ (session storage, rate limiting)
- **Connection Pooling**: SQLAlchemy pool (20 connections)
- **Replication**: Active-Passive (optional for HA)

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)
- **Load Balancing**: Nginx or cloud provider LB
- **SSL/TLS**: Let's Encrypt certificates
- **Secrets Management**: Environment variables + Vault (optional)
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (optional)

---

## 3. Feature Specifications

### 3.1 Core Features

#### 3.1.1 Single Transaction Analysis
**Purpose**: Enable analysts to submit individual transactions and receive instant fraud assessment

**User Flow**:
1. Navigate to "Analyze Transaction" page
2. Enter customer details (name, age, job, location)
3. Enter transaction details (amount, merchant, time)
4. Enter merchant location details
5. Click "Analyze Transaction"
6. Receive fraud assessment with risk factors

**API Response**:
- Fraud status (legitimate/suspicious/fraudulent)
- Fraud probability (0-1 confidence)
- List of identified risk factors
- Recommended action (approve/review/block)
- Model version for traceability

**Performance Requirement**: <200ms response time (p95)

#### 3.1.2 Dashboard with Real-time KPIs
**Purpose**: Provide leadership with at-a-glance fraud metrics and trends

**Key Performance Indicators**:
1. **Total Transactions**: Count of all analyzed transactions
2. **Fraud Detected**: Number of confirmed fraudulent transactions
3. **Detection Rate**: Percentage of transactions flagged as fraudulent
4. **Pending Reviews**: Count of unresolved alerts awaiting analyst action
5. **Fraudulent Amount**: Total USD amount blocked
6. **Legitimate Amount**: Total USD amount approved
7. **Average Risk Score**: Mean fraud probability across all transactions

**Charts**:
1. **Fraud Trend**: 7-day line chart showing fraud vs. legitimate vs. suspicious
2. **Category Risk**: Bar chart showing fraud rate by merchant category
3. **Time-based Analysis**: Hourly fraud patterns

**Time Range Selection**: 7, 30, or 90 day views

#### 3.1.3 Transaction History with Advanced Filtering
**Purpose**: Enable detailed investigation of historical transactions

**Filterable Fields**:
- Transaction ID (text search)
- Customer name (text search)
- Amount range (min-max)
- Fraud status (all, legitimate, suspicious, fraudulent)
- Merchant category (dropdown)
- Date range (start-end date picker)

**Display Columns**:
- Transaction ID (truncated UUID)
- Customer name
- Transaction amount
- Merchant category
- Fraud status (color-coded badge)
- Risk score (0-100% visualization)
- Transaction date
- Action button (view details)

**Transaction Detail Modal**:
- Full transaction data
- Risk factors breakdown (with severity levels)
- Customer and merchant information
- ML model confidence score
- Analyst notes (editable)
- Flag/unflag capability

**Export**: CSV export with 100 transactions per file limit

#### 3.1.4 Alerts Management
**Purpose**: Surface high-risk transactions for immediate analyst attention

**Alert Types**:
- High fraud probability detected
- Geographic anomaly (customer location mismatch)
- Unusual time pattern (off-hours transaction)
- High-risk category transaction
- Velocity anomaly (multiple rapid transactions)
- Repeated merchant for different cards

**Priority Levels**:
- **Critical** (>85% fraud probability): Immediate action required
- **High** (70-85% probability): Review within 1 hour
- **Medium** (50-70% probability): Review within 4 hours
- **Low** (<50% probability): Review within 24 hours

**Alert Workflow**:
1. Alert generated automatically on transaction analysis
2. Displayed in alerts queue
3. Analyst reviews and can mark as resolved
4. Recorded in audit trail with analyst notes

#### 3.1.5 Audit Trail & Compliance Logging
**Purpose**: Maintain immutable record of all system activity

**Logged Actions**:
- Transaction analysis (who, when, result)
- Transaction flagging/unflagging
- Alert resolution
- System configuration changes
- User login/logout
- Report generation
- Data export

**Audit Data**:
- User ID
- Action type
- Resource ID
- Before/after values
- Timestamp
- IP address
- User agent

**Retention**: Configurable (minimum 90 days, up to 7 years)

#### 3.1.6 Admin Panel
**Purpose**: System configuration and user management

**Admin Capabilities**:
- User management (add/remove users, assign roles)
- System configuration (model thresholds, alert settings)
- Security settings (SSO configuration, IP whitelisting)
- System monitoring (API health, database status, cache status)
- Report generation
- Backup management
- Integration configuration

### 3.2 Advanced Features (Phase 5-7)

#### 3.2.1 Batch Processing
**Capability**: Process 50,000 transactions in a single batch job

**Workflow**:
1. Upload CSV file with transaction data
2. System validates format and data quality
3. Creates async batch job
4. Processes transactions in parallel workers
5. Returns results CSV with fraud assessment for each transaction
6. Stores results for 30 days

**Performance**: ~50K transactions in 5 minutes

#### 3.2.2 Email & SMS Notifications
**Purpose**: Alert analysts to critical fraud cases

**Triggers**:
- Critical priority alert generated
- High fraud detection spike (>20% change)
- System anomaly detected

**Delivery**: Via email and optional SMS

#### 3.2.3 Third-party API Integration
**Purpose**: Enable banking systems to submit transactions for analysis

**API Endpoints**:
- POST `/api/v1/transactions/analyze` - Submit single transaction
- POST `/api/v1/batch/submit` - Submit batch job
- GET `/api/v1/batch/status/{jobId}` - Check processing status
- GET `/api/v1/batch/result/{jobId}` - Retrieve results
- POST `/api/v1/webhooks/subscribe` - Register webhook for real-time results

**Authentication**: API key + HMAC signature validation

**Rate Limiting**: 1000 requests/minute per API key

---

## 4. Security Architecture

### 4.1 Authentication & Authorization

#### SSO Integration
- **Protocols**: OIDC (primary), SAML (fallback)
- **Providers**: Okta, Azure AD, Keycloak
- **MFA**: Enforced via SSO provider
- **Session Duration**: 60 minutes (configurable)
- **Token Refresh**: Automatic with 7-day maximum

#### Role-Based Access Control
```
Admin:
  - All permissions
  - User management
  - System configuration
  - View all audit logs
  - Access admin panel

Analyst:
  - Analyze transactions
  - View dashboard
  - Manage alerts
  - View transaction history
  - Export data
  - Add notes to transactions

Viewer:
  - View dashboard
  - View transaction history (read-only)
  - View reports
  - Cannot analyze or modify
```

### 4.2 Data Protection

#### Encryption
- **In Transit**: TLS 1.3 (all network communication)
- **At Rest**: AES-256 encryption for PII
- **Database**: SSL connections required
- **Backups**: Encrypted with KMS key rotation

#### PII Protection
- **PII Fields**: Name, SSN, account numbers
- **Encryption Key**: Rotated annually
- **Access Logging**: All PII access logged
- **Masking**: PII masked in logs and audit trails

### 4.3 API Security

#### Authentication
- Bearer token in Authorization header
- JWT validation on every request
- Token expiration checking

#### Rate Limiting
- 1000 requests/minute per user
- 5000 requests/minute per API key
- 429 Too Many Requests response

#### Input Validation
- Pydantic schemas enforce type safety
- Amount must be positive number
- Email/phone validation
- Geographic coordinates validation (-90 to 90 latitude, -180 to 180 longitude)

#### SQL Injection Prevention
- SQLAlchemy parameterized queries only
- No raw SQL strings

### 4.4 Compliance Controls

#### PCI-DSS
- Cardholder data encrypted
- Access logging
- Regular security assessment
- Network segmentation

#### GDPR
- Data minimization
- Consent tracking
- Right to access / deletion
- Data retention policies
- DPIA documentation

#### SOX
- Immutable audit trails
- Segregation of duties
- Change management
- Internal controls

---

## 5. User Workflows

### 5.1 Daily Analyst Workflow

**Morning**:
1. Login via SSO (auto-redirect to Okta/Azure AD)
2. Review dashboard (fraud metrics, pending alerts)
3. Check alerts queue for critical items

**Throughout Day**:
1. Analyze transactions as they arrive
2. Investigate high-risk transactions using history filter
3. Resolve alerts by reviewing transaction details
4. Add notes to transactions for investigation trail

**End of Day**:
1. Generate daily fraud report
2. Escalate critical cases to management
3. Review audit trail for activity verification

### 5.2 Manager Oversight Workflow

**Daily**:
1. Check dashboard KPIs
2. Review critical alerts resolved by team
3. Monitor fraud detection rate trends

**Weekly**:
1. Generate fraud report for leadership
2. Review false positive rate
3. Adjust alert thresholds if needed

### 5.3 Admin Configuration Workflow

**Initial Setup**:
1. Configure SSO provider connection
2. Create analyst user accounts
3. Set fraud model thresholds
4. Configure alert rules

**Ongoing**:
1. Manage user access and roles
2. Monitor system health
3. Review security audit trail
4. Update model/thresholds as needed

---

## 6. API Specification

### 6.1 Transaction Analysis Endpoint

```
POST /api/v1/transactions/analyze

Headers:
  Authorization: Bearer <jwt-token>
  Content-Type: application/json

Request Body:
{
  "customer_name": "John Doe",
  "customer_gender": "M|F|Other",
  "customer_age": 18-120,
  "customer_job": "Software Engineer",
  "customer_city": "San Francisco",
  "customer_state": "CA",
  "customer_city_population": 100000-10000000,
  "customer_latitude": -90 to 90,
  "customer_longitude": -180 to 180,
  "merchant_latitude": -90 to 90,
  "merchant_longitude": -180 to 180,
  "merchant_category": "Groceries|Online Shopping|Travel|...",
  "merchant_name": "Merchant Name (optional)",
  "amount": 0.01-999999.99,
  "transaction_datetime": "2024-01-15T14:30:00Z"
}

Response (200 OK):
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "fraud_status": "legitimate|suspicious|fraudulent",
  "fraud_probability": 0.15,
  "confidence_score": 0.92,
  "risk_factors": [
    {
      "factor": "High Transaction Amount",
      "severity": "high",
      "description": "Transaction amount $5000 exceeds typical threshold"
    }
  ],
  "recommended_action": "approve|review|block",
  "analysis_timestamp": "2024-01-15T14:30:00Z",
  "model_version": "1.0.0"
}

Error Response (401):
{ "detail": "Invalid token", "error_code": "UNAUTHORIZED" }

Error Response (422):
{ "detail": "Validation error", "error_code": "INVALID_REQUEST" }
```

### 6.2 Dashboard Endpoint

```
GET /api/v1/dashboard/stats?days=7

Headers:
  Authorization: Bearer <jwt-token>

Response (200 OK):
{
  "total_transactions": 1250,
  "fraud_detected": 45,
  "fraudulent_amount": 125000.50,
  "legitimate_amount": 2500000.00,
  "average_fraud_probability": 0.25,
  "detection_rate": 3.6,
  "high_risk_alerts": 12,
  "pending_reviews": 8
}
```

---

## 7. Database Schema

### Core Tables

#### users
- id (Primary Key)
- email (Unique)
- sso_id (Unique)
- first_name, last_name
- role (admin|analyst|viewer)
- department, bank_code
- is_active
- created_at, updated_at

#### transactions
- id (Primary Key)
- transaction_id (Unique)
- analyst_id (Foreign Key to users)
- Customer info (name, gender, age, job, location)
- Merchant info (category, location)
- Transaction info (amount, datetime)
- fraud_status (enum)
- fraud_probability (float)
- risk_factors (JSON)
- model_version
- is_flagged, manual_review_status
- created_at, updated_at

#### alerts
- id (Primary Key)
- transaction_id (Foreign Key)
- alert_type
- priority (low|medium|high|critical)
- message
- assigned_to (Foreign Key to users)
- is_resolved, resolved_at
- resolution_notes
- created_at, updated_at

#### audit_logs
- id (Primary Key)
- transaction_id (Foreign Key, nullable)
- user_id (Foreign Key, nullable)
- action (analyzed|viewed|modified|flagged)
- resource_type, resource_id
- changes (JSON)
- ip_address, user_agent
- created_at (Index)

#### batch_jobs
- id (Primary Key)
- job_id (Unique)
- user_id (Foreign Key)
- file_name
- total_records, processed_records, failed_records
- status (pending|processing|completed|failed)
- progress_percentage
- results_summary (JSON)
- created_at, started_at, completed_at

---

## 8. Deployment & Operations

### 8.1 Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python scripts/init_db.py
python -m uvicorn main:app --reload

# Frontend
npm install
npm run dev
```

### 8.2 Docker Compose

```bash
docker-compose up -d
# All services (postgres, redis, backend, frontend) start
```

### 8.3 Production (Kubernetes)

```bash
kubectl create namespace fraudshield
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## 9. Monitoring & Observability

### 9.1 Key Metrics

**System Metrics**:
- API response time (p50, p95, p99)
- Error rate by endpoint
- Database connection pool utilization
- Redis cache hit rate
- ML model inference time

**Business Metrics**:
- Total transactions analyzed (daily/weekly)
- Fraud detection rate
- False positive rate
- Alert resolution time (avg)
- Average fraud amount

### 9.2 Alerting Thresholds

- API response time > 2 seconds
- Error rate > 1%
- Database connection failures
- Memory usage > 85%
- CPU usage > 80%

---

## 10. Implementation Roadmap

### Phase 1 ✅ COMPLETE
- Backend infrastructure (FastAPI, PostgreSQL)
- Fraud detection model integration
- Database schema and migrations
- Authentication middleware

### Phase 2 ✅ COMPLETE
- Frontend setup (Next.js 16)
- SSO login component
- Protected routes
- Navigation sidebar
- API client

### Phase 3 ✅ COMPLETE
- Dashboard with KPIs
- Charts (Recharts)
- Transaction analysis form
- Real-time metrics

### Phase 4 ✅ COMPLETE
- Transaction history page
- Advanced filtering
- Detail modal
- CSV export

### Phase 5 📋 READY
- Alerts system
- Email notifications
- Alert resolution workflow

### Phase 6 📋 READY
- Audit trail viewer
- Admin panel
- User management
- System configuration

### Phase 7 📋 READY
- Batch processing
- API integration endpoints
- Webhook support
- Rate limiting

---

## 11. Success Criteria

### User Experience
- [ ] Dashboard loads in < 500ms
- [ ] Transaction analysis returns in < 200ms
- [ ] No more than 2 clicks to analyze a transaction
- [ ] Filtering reduces results by 90%+

### System Performance
- [ ] API availability: 99.9%+
- [ ] p95 response time: < 1 second
- [ ] Database query time: < 100ms
- [ ] Support 1000+ transactions/second

### Security
- [ ] All PII encrypted
- [ ] All audit logs immutable
- [ ] Zero unauthorized data access in 90 days
- [ ] Monthly security assessments pass

### Business Impact
- [ ] Fraud detection accuracy: 85%+
- [ ] False positive rate: < 10%
- [ ] Average resolution time: < 30 minutes
- [ ] Analyst satisfaction: > 4.5/5

---

## Conclusion

FraudShield is a comprehensive, production-ready fraud detection platform that transforms the existing ML model into an enterprise-grade product. With enterprise-scale security, compliance controls, intuitive UI, and robust APIs, it's ready for immediate deployment in financial institutions.

**Next Steps**:
1. Deploy development environment
2. Complete SSO provider configuration
3. Run security assessment
4. Begin user acceptance testing
5. Plan production rollout

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Final - Ready for Deployment
