# FraudShield Enterprise Deployment Guide

## System Overview

FraudShield is a comprehensive fraud detection system with:
- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Backend**: Python FastAPI with machine learning model integration
- **Database**: PostgreSQL for transaction history, audit logs, and user management
- **Cache**: Redis for session management and real-time data
- **Authentication**: SSO integration (Okta, Azure AD, or Keycloak)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Bank Employee (Browser)               │
├─────────────────────────────────────────────────────────┤
│                    Next.js Frontend (Port 3000)          │
│  - Dashboard, Transaction Analysis, History, Alerts     │
│  - SSO Authentication, Role-based Access Control        │
├─────────────────────────────────────────────────────────┤
│                  FastAPI Backend (Port 8000)             │
│  - Transaction Analysis Engine                          │
│  - ML Model Integration (Random Forest)                 │
│  - Audit Logging, Alert Management                      │
├─────────────────────────────────────────────────────────┤
│                Database Layer                            │
│  - PostgreSQL: Users, Transactions, Alerts, Audit Logs  │
│  - Redis: Caching, Sessions, Real-time Data             │
├─────────────────────────────────────────────────────────┤
│              SSO Provider (Okta/Azure/Keycloak)         │
│              Third-party Systems Integration             │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker & Docker Compose (for containerized deployment)
- Python 3.10+ (for backend)
- Node.js 18+ (for frontend)
- PostgreSQL 14+ database instance
- Redis 6+ cache instance
- SSO Provider credentials (Okta/Azure AD/Keycloak)

## Installation & Setup

### 1. Environment Configuration

Copy the environment template and configure:
```bash
cp .env.example .env
```

Edit `.env` with your specific configuration:
```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/fraudshield

# Redis
REDIS_URL=redis://redis:6379

# SSO Configuration
SSO_PROVIDER=okta
SSO_DOMAIN=https://your-domain.okta.com
SSO_CLIENT_ID=your_client_id
SSO_CLIENT_SECRET=your_client_secret

# API Keys
JWT_SECRET_KEY=your-secure-secret-key-here
```

### 2. Database Setup

Initialize the database:
```bash
cd backend
python scripts/init_db.py
```

This creates all tables and default users:
- Admin user: `admin@bank.com`
- Analyst user: `analyst@bank.com`

### 3. Backend Setup

Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

Start the FastAPI server:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup

Install dependencies:
```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the development server:
```bash
npm run dev
```

## Docker Deployment

### Using Docker Compose

Create `docker-compose.yml` at project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: fraudshield_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: fraudshield_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://fraudshield_user:secure_password@postgres:5432/fraudshield_db
      REDIS_URL: redis://redis:6379
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run the stack:
```bash
docker-compose up -d
```

## Production Deployment

### Kubernetes Deployment

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fraudshield-backend
  namespace: fraudshield
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fraudshield-backend
  template:
    metadata:
      labels:
        app: fraudshield-backend
    spec:
      containers:
      - name: backend
        image: your-registry/fraudshield-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: fraudshield-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: fraudshield-secrets
              key: redis-url
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### SSL/TLS Configuration

Use Let's Encrypt with Certbot:
```bash
certbot certonly --standalone -d fraudshield.yourdomain.com
```

Configure Nginx reverse proxy to handle SSL termination.

## Security Configuration

### Database Security
- Enable SSL connections to PostgreSQL
- Use strong passwords and rotate regularly
- Implement column-level encryption for PII

### API Security
- Rate limiting on all endpoints
- CORS configured for authorized domains only
- JWT token expiration: 60 minutes
- Refresh token rotation implemented

### SSO Integration
- Verify tokens with SSO provider
- Enforce MFA in SSO provider
- Validate redirect URIs

### Data Protection
- PII encrypted at rest with AES-256
- All data in transit uses TLS 1.3
- Audit logging for all operations
- GDPR-compliant data retention policies

## Monitoring & Logging

### Application Monitoring
- Prometheus metrics at `/metrics`
- Grafana dashboards configured
- Alert thresholds:
  - API response time > 2s
  - Database connection failures
  - High fraud detection rate anomalies

### Logging
- ELK Stack (Elasticsearch, Logstash, Kibana) integration
- Centralized log aggregation
- 90-day log retention policy

## API Endpoints

### Transaction Analysis
```
POST /api/v1/transactions/analyze
- Requires: Bearer token, transaction data
- Returns: Fraud probability, risk factors, recommended action
- Response time: <200ms
```

### Dashboard
```
GET /api/v1/dashboard/stats?days=7
- Requires: Bearer token
- Returns: KPIs, fraud metrics, pending reviews
```

### Batch Processing
```
POST /api/v1/batch/submit
- Requires: Bearer token, CSV file (max 50K records)
- Returns: Job ID, initial status
- Processing: Async, typically completes in minutes
```

## Backup & Recovery

### Database Backup
```bash
# Daily backup to S3
pg_dump fraudshield_db | gzip | aws s3 cp - s3://fraudshield-backups/db-$(date +%Y%m%d).sql.gz

# Point-in-time recovery
pg_restore --create s3://fraudshield-backups/db-YYYYMMDD.sql.gz
```

### Recovery Procedures
1. **Database Failure**: Switch to replica database
2. **Backend Failure**: Auto-scaling group handles recovery
3. **Frontend Failure**: CDN serves cached version
4. **Complete Outage**: Restore from last backup

## Performance Optimization

### Frontend
- Static site generation for landing pages
- Image optimization with Next.js Image component
- CSS-in-JS minification
- Bundle analysis: `npm run analyze`

### Backend
- Database query optimization and indexing
- Redis caching for frequently accessed data
- Connection pooling for database
- Async processing for batch jobs

### Database
- Create indexes on frequently queried columns
- Partition transaction table by date range
- Archive old audit logs to cold storage
- Vacuum and analyze regularly

## Troubleshooting

### API Connection Issues
```
Error: Failed to connect to backend
Solution: 
1. Verify API_URL environment variable
2. Check backend service is running: curl http://localhost:8000/health
3. Check CORS configuration in backend/main.py
```

### Authentication Failures
```
Error: Invalid token or SSO not responding
Solution:
1. Verify SSO credentials in .env
2. Check SSO provider status
3. Validate redirect URI configuration
4. Review audit logs for failed attempts
```

### Database Connection Errors
```
Error: Connection pool exhausted
Solution:
1. Increase max connections in PostgreSQL config
2. Review slow queries with EXPLAIN ANALYZE
3. Implement query timeouts
4. Check for idle connections
```

## Support & Documentation

- API Documentation: `/api/docs` (Swagger UI)
- Backend Logs: `docker logs fraudshield-backend`
- Database Queries: PostgreSQL logs at `/var/log/postgresql/`
- Monitoring Dashboard: http://grafana:3000

## Compliance & Regulations

- PCI-DSS: Encryption, access controls, audit logs
- GDPR: Data minimization, retention policies, right to be forgotten
- SOX: Financial controls and audit trails
- AML/KYC: Transaction monitoring and reporting

## Maintenance & Updates

### Regular Tasks
- Daily: Monitor dashboards, check alerts
- Weekly: Review audit logs, backup verification
- Monthly: Security patches, dependency updates
- Quarterly: Penetration testing, audit review

### Model Updates
- Monitor model performance metrics
- Retrain when accuracy drops below 85%
- Blue-green deployment for zero downtime
- Rollback capability maintained for 30 days
