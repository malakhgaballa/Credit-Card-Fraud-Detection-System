# FraudShield - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRAUDSHIELD PLATFORM                               │
│                     Enterprise Fraud Detection System                        │
└─────────────────────────────────────────────────────────────────────────────┘

                                     Users
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌──────────────────────────────────┐      ┌──────────────────────────────┐│
│  │      FRONTEND LAYER              │      │    API GATEWAY / LB          ││
│  │                                  │      │  (Nginx / Cloud LB)          ││
│  │  • Next.js 16 (React 19)         │  ◄───┤  • SSL/TLS Termination      ││
│  │  • Port 3000                     │      │  • CORS Configuration        ││
│  │  • TypeScript                    │      │  • Rate Limiting             ││
│  │  • Tailwind CSS 4                │      │  • Request Routing           ││
│  │  • Recharts                      │      └──────────────────────────────┘│
│  │  • SWR (Data Fetching)           │                                       │
│  │                                  │                                       │
│  │  Pages:                          │                                       │
│  │  • Dashboard (KPIs, Charts)      │                                       │
│  │  • Analyze (Transaction Form)    │                                       │
│  │  • History (Filtered Table)      │                                       │
│  │  • Alerts (Management)           │                                       │
│  │  • Admin (Configuration)         │                                       │
│  │  • Login (SSO)                   │                                       │
│  │                                  │                                       │
│  │  Components:                     │                                       │
│  │  • Auth Context                  │                                       │
│  │  • Sidebar Navigation            │                                       │
│  │  • KPI Cards                     │                                       │
│  │  • Charts                        │                                       │
│  │  • Filters                       │                                       │
│  └──────────────────────────────────┘                                       │
│           │                                                                 │
│           │ HTTPS/TLS 1.3                                                  │
│           ▼                                                                 │
│  ┌──────────────────────────────────┐                                      │
│  │     BACKEND LAYER                │                                      │
│  │                                  │                                      │
│  │  • FastAPI (Python)              │                                      │
│  │  • Port 8000                     │                                      │
│  │  • ASGI Server (Uvicorn)         │                                      │
│  │  • Multiple Instances (x3)       │                                      │
│  │                                  │                                      │
│  │  Modules:                        │                                      │
│  │  • Transaction Analysis Engine   │                                      │
│  │  • ML Model Integration          │                                      │
│  │  • Dashboard Calculations        │                                      │
│  │  • Alert Management              │                                      │
│  │  • Audit Logging                 │                                      │
│  │  • User Management               │                                      │
│  │  • Batch Processing              │                                      │
│  │                                  │                                      │
│  │  API Endpoints:                  │                                      │
│  │  POST   /api/v1/transactions/... │                                      │
│  │  GET    /api/v1/dashboard/...    │                                      │
│  │  GET    /api/v1/alerts/...       │                                      │
│  │  GET    /api/v1/audit-trail/...  │                                      │
│  │  POST   /api/v1/batch/...        │                                      │
│  │                                  │                                      │
│  │  Authentication:                 │                                      │
│  │  • JWT Token Validation          │                                      │
│  │  • SSO Integration               │                                      │
│  │  • RBAC Enforcement              │                                      │
│  └──────────────────────────────────┘                                      │
│           │                    │                                           │
│           │ SQL              │ Cache                                       │
│           ▼                  ▼                                             │
│  ┌──────────────────┐  ┌──────────────────┐                              │
│  │  POSTGRESQL      │  │     REDIS        │                              │
│  │                  │  │                  │                              │
│  │  Tables:         │  │  Stores:         │                              │
│  │  • users         │  │  • Sessions      │                              │
│  │  • transactions  │  │  • Cache         │                              │
│  │  • alerts        │  │  • Counters      │                              │
│  │  • audit_logs    │  │  • Queues        │                              │
│  │  • batch_jobs    │  │                  │                              │
│  │  • metrics       │  │  Port: 6379      │                              │
│  │                  │  └──────────────────┘                              │
│  │  Port: 5432      │                                                     │
│  │  Replicated: HA  │                                                     │
│  └──────────────────┘                                                     │
│           │                                                               │
│           ▼                                                               │
│  ┌──────────────────────────────────┐                                    │
│  │   BACKUP STORAGE                 │                                    │
│  │   (S3 / GCS / On-Premise)        │                                    │
│  │                                  │                                    │
│  │  • Database Backups (Daily)      │                                    │
│  │  • Encrypted with KMS            │                                    │
│  │  • 30-Day Retention              │                                    │
│  └──────────────────────────────────┘                                    │
│           ▲                                                               │
└───────────┼───────────────────────────────────────────────────────────────┘
            │
            │
┌───────────▼───────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐    │
│  │           EXTERNAL INTEGRATIONS                                  │    │
│  │                                                                   │    │
│  │  SSO Providers:    Okta / Azure AD / Keycloak                   │    │
│  │  Email Service:    SendGrid / AWS SES / SMTP                    │    │
│  │  SMS Service:      Twilio / AWS SNS                              │    │
│  │  Monitoring:       Prometheus / Grafana                          │    │
│  │  Logging:          ELK Stack / Datadog                           │    │
│  │  Banking APIs:     ACH / Wire / Card Networks                    │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Transaction Analysis Flow

```
┌──────────────┐
│  Analyst/API │
└──────┬───────┘
       │
       │ POST /api/v1/transactions/analyze
       │ + JWT Token
       │ + Transaction Data
       ▼
┌──────────────────┐
│ API Gateway      │
│ • Validate Token │
│ • Rate Limit     │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐
│ FastAPI Endpoint         │
│ • Auth Middleware        │
│ • Input Validation       │
│ • Pydantic Schema Check  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Transaction Analysis     │
│ • Feature Extraction     │
│ • Distance Calculation   │
│ • Risk Factor Analysis   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ ML Model Inference       │
│ • Random Forest Predict  │
│ • Probability Score      │
│ • Feature Importance     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Store Results            │
│ • Save to DB             │
│ • Create Alert (if risk) │
│ • Log to Audit Trail     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Return Response          │
│ {                        │
│   fraud_status,          │
│   fraud_probability,     │
│   risk_factors,          │
│   recommended_action     │
│ }                        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────┐
│ Frontend     │
│ • Display    │
│ • Log Action │
│ • Store in   │
│   Session    │
└──────────────┘
```

## Authentication Flow

```
┌──────────────┐
│   User       │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. Click "Sign In with SSO"
       │
       ▼
┌──────────────────┐
│   Next.js App    │
│   /login page    │
└──────┬───────────┘
       │
       │ 2. Redirect to SSO Provider
       │
       ▼
┌──────────────────────────┐
│  SSO Provider            │
│  (Okta/Azure/Keycloak)   │
│                          │
│  • Login Form            │
│  • MFA Check             │
│  • User Verification     │
└──────┬───────────────────┘
       │
       │ 3. Authorization Code
       │
       ▼
┌──────────────────────────┐
│  Next.js API Route       │
│  /api/auth/callback      │
│                          │
│  • Exchange Code for JWT │
│  • Verify Token          │
│  • Get User Info         │
└──────┬───────────────────┘
       │
       │ 4. Store Token
       │
       ▼
┌──────────────────────────┐
│  Browser LocalStorage    │
│  • JWT Token             │
│  • User Profile          │
│  • Session Data          │
└──────┬───────────────────┘
       │
       │ 5. Redirect to Dashboard
       │
       ▼
┌──────────────────────────┐
│  Protected Pages         │
│  • Dashboard             │
│  • Analyze               │
│  • History               │
│  • Alerts                │
└──────────────────────────┘
```

## Deployment Architecture

### Development

```
Developer Laptop
├── Docker Desktop
├── docker-compose up
└── Services
    ├── Frontend (Next.js) - :3000
    ├── Backend (FastAPI) - :8000
    ├── PostgreSQL - :5432
    └── Redis - :6379
```

### Staging / Production

```
Kubernetes Cluster
├── Namespace: fraudshield
├── Frontend Pods (x3)
│   └── Next.js containers with TLS
├── Backend Pods (x3)
│   └── FastAPI containers
├── PostgreSQL StatefulSet (HA)
│   ├── Primary Pod
│   └── Replica Pod
├── Redis StatefulSet
├── Persistent Volumes
│   ├── Database Data
│   └── Cache Data
├── ConfigMaps
│   └── Application Configuration
├── Secrets
│   └── Encrypted Credentials
├── Services
│   ├── Frontend Service (LoadBalancer)
│   ├── Backend Service (ClusterIP)
│   ├── Database Service (ClusterIP)
│   └── Cache Service (ClusterIP)
└── Ingress
    ├── TLS Certificate
    ├── DNS: fraudshield.yourdomain.com
    └── Routing Rules

External Services
├── SSL Certificate (Let's Encrypt)
├── Backup Storage (S3/GCS)
├── Monitoring (Prometheus/Grafana)
├── Logging (ELK Stack)
└── SSO Provider (Okta/Azure/Keycloak)
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRAUDSHIELD DATABASE                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      USERS       │ (Role-Based Access)
├──────────────────┤
│ id (PK)          │
│ email (UQ)       │
│ sso_id (UQ)      │
│ role (analyst,   │
│      admin,      │
│      viewer)     │
│ department       │
│ created_at       │
└────────┬─────────┘
         │ 1:N
         │
┌────────▼──────────────────┐
│    TRANSACTIONS           │ (Analysis Results)
├───────────────────────────┤
│ id (PK)                   │
│ transaction_id (UQ)       │
│ analyst_id (FK) ──────────┼──► users
│ customer_name             │
│ customer_age              │
│ amount                    │
│ merchant_category         │
│ fraud_status (enum)       │
│ fraud_probability (0-1)   │
│ risk_factors (JSON)       │
│ created_at (indexed)      │
└────────┬──────────────────┘
         │ 1:N
         │
┌────────▼──────────────────┐
│       ALERTS              │ (Fraud Alerts)
├───────────────────────────┤
│ id (PK)                   │
│ transaction_id (FK) ──────┼──► transactions
│ alert_type                │
│ priority (enum)           │
│ assigned_to (FK) ─────────┼──► users
│ is_resolved               │
│ resolved_at               │
│ created_at                │
└───────────────────────────┘

┌────────────────────────────┐
│      AUDIT_LOGS            │ (Immutable Logs)
├────────────────────────────┤
│ id (PK)                    │
│ transaction_id (FK)        │
│ user_id (FK) ──────────────┼──► users
│ action (analyzed,          │
│        viewed,             │
│        modified)           │
│ resource_type              │
│ resource_id                │
│ changes (JSON)             │
│ ip_address                 │
│ created_at (indexed)       │
└────────────────────────────┘

┌────────────────────────────┐
│      BATCH_JOBS            │ (Async Processing)
├────────────────────────────┤
│ id (PK)                    │
│ job_id (UQ)                │
│ user_id (FK) ──────────────┼──► users
│ file_name                  │
│ total_records              │
│ processed_records          │
│ status (pending,           │
│        processing,         │
│        completed)          │
│ progress_percentage        │
│ created_at                 │
└────────────────────────────┘
```

## API Endpoint Structure

```
/api/v1/
├── /health
│   └── GET: System health check
│
├── /info
│   └── GET: API information & config
│
├── /transactions
│   ├── POST /analyze
│   │   └── Single transaction analysis
│   ├── GET /history
│   │   └── Transaction history with filters
│   └── GET /{id}
│       └── Transaction details
│
├── /dashboard
│   ├── GET /stats
│   │   └── KPI statistics
│   ├── GET /trends
│   │   └── Trend data (7/30/90 days)
│   └── GET /category-risk
│       └── Risk by merchant category
│
├── /alerts
│   ├── GET
│   │   └── List alerts (paginated)
│   └── PATCH /{id}
│       └── Update alert status
│
├── /audit-trail
│   └── GET
│       └── Audit logs (paginated)
│
└── /batch
    ├── POST /submit
    │   └── Submit batch job
    ├── GET /status/{jobId}
    │   └── Check job status
    └── GET /result/{jobId}
        └── Get batch results
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                           │
│  • HTTPS/TLS 1.3                                        │
│  • HSTS Headers                                         │
│  • CORS Restrictions                                    │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  API GATEWAY / LOAD BALANCER LAYER                      │
│  • Rate Limiting                                        │
│  • IP Whitelisting (optional)                           │
│  • Request Validation                                   │
│  • DDoS Protection                                      │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                      │
│  • JWT Token Validation                                 │
│  • SSO Integration                                      │
│  • Role-Based Access Control                            │
│  • Input Validation (Pydantic)                          │
│  • Audit Logging (All actions)                          │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  DATABASE LAYER                                         │
│  • SSL Connections Required                             │
│  • Row-Level Security (RLS)                             │
│  • Parameterized Queries (SQLAlchemy)                   │
│  • Encryption at Rest (AES-256 for PII)                 │
│  • User Isolation                                       │
└─────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────┐
│  APPLICATION METRICS (Prometheus)                       │
│  • HTTP request duration                                │
│  • Error rate by endpoint                               │
│  • ML model inference time                              │
│  • Database query time                                  │
│  • Redis cache hit rate                                 │
│  • User session count                                   │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  VISUALIZATION (Grafana)                                │
│  • Real-time dashboards                                 │
│  • Performance trends                                   │
│  • System resource usage                                │
│  • User activity                                        │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  ALERTING (Alert Manager)                               │
│  • API response time > 2s                               │
│  • Error rate > 1%                                      │
│  • Database connection failures                         │
│  • Memory/CPU usage high                                │
└─────────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│  LOGGING (ELK Stack / Datadog)                          │
│  • Application logs                                     │
│  • API request logs                                     │
│  • Database logs                                        │
│  • Audit trail                                          │
└─────────────────────────────────────────────────────────┘
```

---

**FraudShield Architecture v1.0**  
**Enterprise-Grade Fraud Detection Platform**  
**Production Ready - Kubernetes & Cloud Native**
