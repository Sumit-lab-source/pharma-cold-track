# PharmaTrack - Pharmaceutical Cold Chain Operations Platform

A comprehensive, GxP-compliant platform for real-time pharmaceutical cold chain logistics management. Built with modern cloud-native architecture on AWS, featuring real-time IoT telemetry, regulatory compliance reporting, and enterprise-grade security.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PharmaTrack Platform                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   IoT        │    │   Kinesis    │    │   Lambda     │    │  DynamoDB│  │
│  │   Devices    │───▶│   Streams    │───▶│   Processors │───▶│  Tables  │  │
│  │  (MQTT/TLS)  │    │  (Encrypted) │    │  (Excursion  │    │(Multi-AZ)│  │
│  └──────────────┘    └──────────────┘    │   Detection) │    └──────────┘  │
│         ▲                                     └──────┬───────┘       ▲      │
│         │                                            │               │      │
│         ▼                                            ▼               ▼      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   AppSync    │◀───│   API GW     │    │   S3         │    │  Cloud   │  │
│  │  (GraphQL)   │    │  (REST)      │    │  (Audit/Obj  │    │  Watch   │  │
│  │  (Real-time) │    └──────────────┘    │   Lock)      │    │  (Logs)  │  │
│  └──────┬───────┘                         └──────────────┘    └──────────┘  │
│         │                                                            │      │
│         ▼                                                            ▼      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        React Frontend (Vite + TS)                    │   │
│  │  Dashboard │ Fleet Map │ Shipments │ Excursions │ Compliance │ Settings │  │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

### 🚛 Real-Time Fleet Tracking
- **Live GPS Monitoring**: Track all vehicles on interactive map (Leaflet + OpenStreetMap)
- **Telemetry Streaming**: Temperature, humidity, door status, reefer status, battery, signal
- **Multi-Sensor Support**: Independent monitoring for truck, trailer, and individual sensors
- **Status Classification**: Active, Offline, Maintenance, Excursion states

### 🌡️ Temperature Compliance (GDP/GxP)
- **Refrigerated**: 2°C - 8°C (Vaccines, Insulin, Biologics)
- **Frozen**: -25°C to -15°C (Cell therapies, Frozen plasma)
- **Controlled Room**: 15°C - 25°C (Stable oral medications)
- **Excursion Classification**:
  - **S1 Critical**: <0°C or >15°C for >30min → TTR < 3 min
  - **S2 High**: 8.1-15°C or 0.1-1.9°C for 1-2hr → TTR < 4 hr
  - **S3 Moderate**: Minor transient deviations → Logged for audit

### 📋 Regulatory Compliance
- **21 CFR Part 11**: Electronic records, digital signatures, audit trails
- **EU GDP 2013/C 343/01**: Good Distribution Practice compliance
- **Immutable Audit Logs**: S3 Object Lock + DynamoDB PITR (10-year retention)
- **Automated Reports**: Daily/Weekly/Monthly/Excursion/Regulatory submissions
- **Digital Signatures**: Cryptographic signing with timestamp verification

### 🔒 Enterprise Security
- **Device Authentication**: X.509 certificates via AWS IoT Core (no shared secrets)
- **Encryption**: KMS-managed keys (AES-256) for data at rest, TLS 1.3 in transit
- **Network Isolation**: VPC with private subnets, VPC Endpoints (PrivateLink)
- **RBAC**: Role-based access (Admin, QA, Operations, Driver, Auditor, Viewer)
- **MFA Required**: For auditor access and sensitive operations

## 📁 Project Structure

```
pharma-cold-track/
├── infrastructure/                 # Terraform IaC
│   ├── vpc/                       # Network (VPC, subnets, NAT, endpoints)
│   ├── iot/                       # IoT Core (things, policies, rules, streams)
│   ├── dynamodb/                  # Tables (telemetry, excursions, shipments, audit)
│   ├── kms/                       # Encryption keys (primary, audit, PII, CloudTrail)
│   ├── iam/                       # Roles and policies
│   └── monitoring/                # CloudWatch, alarms, dashboards
├── services/                      # Backend services
│   ├── iot-processor/             # Lambda functions for telemetry processing
│   ├── api/                       # AppSync GraphQL resolvers
│   └── alerts/                    # SNS/SES notification handlers
├── compliance/                    # Regulatory policies
│   ├── policies/                  # IAM, S3, KMS policies
│   ├── audit/                     # Audit log schemas
│   └── retention/                 # Data retention configurations
├── frontend/                      # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── contexts/              # React contexts (Auth, Data)
│   │   ├── pages/                 # Page components
│   │   ├── hooks/                 # Custom hooks
│   │   ├── types/                 # TypeScript definitions
│   │   ├── services/              # API clients
│   │   └── utils/                 # Helper functions
│   └── public/                    # Static assets
├── scripts/                       # Deployment and utility scripts
└── docs/                          # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- AWS CLI configured with appropriate permissions
- Terraform 1.5+
- Docker (for local development)

### Frontend Development

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Infrastructure Deployment

```bash
# Deploy in order (dependencies)
cd infrastructure/kms && terraform init && terraform apply
cd ../vpc && terraform init && terraform apply
cd ../dynamodb && terraform init && terraform apply
cd ../iot && terraform init && terraform apply
cd ../iam && terraform init && terraform apply
```

### Environment Variables

Create `.env` files for each environment:

```bash
# frontend/.env
VITE_API_URL=https://api.pharmatrack.example.com
VITE_APPSYNC_URL=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxx
```

## 📊 Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | KPIs, compliance trends, fleet overview, recent alerts |
| Fleet | `/fleet` | Interactive map, vehicle list, real-time telemetry |
| Shipments | `/shipments` | Shipment tracking, documentation, temperature logs |
| Excursions | `/excursions` | Excursion management, regulatory workflow |
| Compliance | `/compliance` | Reports, audit logs, certifications |
| Settings | `/settings` | Profile, notifications, appearance, security, API |

## 🔧 Technology Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **React Router 7** for navigation
- **Tailwind CSS 4** for styling
- **Chart.js** + **react-chartjs-2** for analytics
- **Leaflet** + **React-Leaflet** for mapping
- **Zustand** for state management
- **React Hook Form** + **Zod** for forms
- **Lucide React** for icons

### Backend (AWS)
- **IoT Core** - Device connectivity (MQTT over TLS)
- **Kinesis Data Streams** - Real-time telemetry ingestion
- **Lambda** - Serverless processing (Python 3.12)
- **DynamoDB** - Multi-region active-active tables with PITR
- **AppSync** - GraphQL API with real-time subscriptions
- **S3** - Object Lock for immutable audit storage
- **KMS** - Customer-managed encryption keys
- **Cognito** - Authentication with MFA
- **SNS/SES** - Alert notifications

### Infrastructure
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipelines
- **CloudWatch** - Monitoring and alerting

## 📋 Compliance Features

### Data Integrity
- **S3 Object Lock** in Compliance Mode (WORM)
- **DynamoDB Point-in-Time Recovery** (35-day window)
- **Cross-Region Replication** for disaster recovery
- **SHA-256 checksums** on all reports

### Audit Trail
- Every user action logged with: user, timestamp, action, resource, outcome, correlation ID
- Immutable storage with 10-year retention
- MFA-gated auditor access role

### Electronic Signatures
- Digital signatures on regulatory reports
- Timestamped with signer identity and role
- Cryptographic verification via KMS

## 🔐 Security Checklist

- [x] VPC with private subnets only
- [x] VPC Endpoints for all AWS services (PrivateLink)
- [x] KMS Customer Managed Keys with key policies
- [x] IoT X.509 certificate authentication
- [x] TLS 1.3 enforcement everywhere
- [x] IAM least-privilege roles
- [x] CloudTrail logging to immutable S3
- [x] WAF on public endpoints
- [x] Shield Advanced for DDoS protection
- [x] MFA for all human access
- [x] Automated secret rotation

## 📈 Monitoring & Observability

### Key Metrics
- **Telemetry Latency**: < 500ms (device → dashboard)
- **Excursion Detection**: < 30 seconds
- **API Availability**: 99.9%
- **Data Durability**: 99.999999999% (S3)

### Alarms
- Device offline > 5 minutes
- Temperature excursion detected
- API error rate > 1%
- Lambda throttling > 0

## 💰 Cost Optimization

- **DynamoDB On-Demand** for unpredictable workloads
- **S3 Intelligent Tiering** for audit logs
- **Lambda Provisioned Concurrency** only for critical paths
- **Kinesis On-Demand** for variable telemetry volume
- **S3 Lifecycle Policies** → Glacier Deep Archive after 90 days

## 🧪 Testing

```bash
# Frontend
cd frontend
npm run test          # Unit tests (Vitest)
npm run test:coverage # Coverage report
npm run lint          # Oxlint

# Infrastructure
cd infrastructure/*
terraform validate
terraform plan
```

## 📦 Deployment

### CI/CD Pipeline (GitHub Actions)
1. **Validate** - Terraform validate, TypeScript compile, lint
2. **Test** - Unit tests, integration tests
3. **Build** - Docker images, frontend assets
4. **Deploy Staging** - Auto-deploy on merge to `develop`
5. **Manual Approval** - Production deployment requires approval
6. **Deploy Production** - Blue/green deployment with rollback

## 📚 Documentation

- [Architecture Decision Records](docs/adr/)
- [API Documentation](docs/api/)
- [Compliance Guide](docs/compliance/)
- [Runbooks](docs/runbooks/)
- [Security Procedures](docs/security/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
   
