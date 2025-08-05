# Factory ERP System - System Architecture Document

## 1. Architecture Overview

### 1.1 High-Level Architecture
The Factory ERP System follows a modern microservices architecture with the following key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile App     │    │  Admin Panel    │
│   (React.js)    │    │ (React Native)  │    │   (React.js)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────────────────────────────┐
         │              API Gateway                      │
         │           (Express.js + JWT)                  │
         └───────────────────────────────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼────┐  ┌──────────┐  ┌─────▼─────┐  ┌──────────┐  ┌────▼────┐
│Inventory│  │Production│  │  Orders   │  │Financial │  │Security │
│Service  │  │ Service  │  │  Service  │  │ Service  │  │Service  │
└────────┘  └──────────┘  └───────────┘  └──────────┘  └─────────┘
    │            │              │              │              │
    └────────────┼──────────────┼──────────────┼──────────────┘
                 │              │              │
         ┌───────────────────────────────────────────────┐
         │              MongoDB Cluster                 │
         │        (Sharded by Company + Date)           │
         └───────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### Frontend Technologies
- **Web Application**: React.js 18+ with TypeScript
- **Mobile Application**: React Native with Expo
- **State Management**: Redux Toolkit + RTK Query
- **UI Framework**: Material-UI (MUI) / Ant Design
- **Charts & Analytics**: Chart.js / D3.js
- **PDF Generation**: jsPDF / React-PDF

#### Backend Technologies
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Authentication**: JWT + Passport.js
- **API Documentation**: Swagger/OpenAPI 3.0
- **File Upload**: Multer + AWS S3
- **Email Service**: Nodemailer + SendGrid
- **SMS/WhatsApp**: Twilio API

#### Database & Storage
- **Primary Database**: MongoDB 6.0+ (Atlas or Self-hosted)
- **Caching**: Redis 7.0+
- **File Storage**: AWS S3 / Google Cloud Storage
- **Search Engine**: MongoDB Atlas Search / Elasticsearch

#### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (Optional)
- **Cloud Platform**: AWS / Google Cloud / Azure
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: PM2 + New Relic / DataDog
- **Logging**: Winston + ELK Stack

## 2. Database Architecture

### 2.1 MongoDB Database Design Strategy

#### Sharding Strategy
```javascript
// Shard Key: { companyId: 1, createdAt: 1 }
// This ensures data isolation by company and efficient time-based queries
```

#### Database Structure
```
factory_erp_db/
├── companies/           # Company master data
├── users/              # User accounts and permissions
├── inventory/          # Raw materials, semi-finished, finished goods
├── production/         # Production orders, processes, tracking
├── orders/            # Customer orders and dispatch
├── financial/         # Transactions, payments, accounts
├── security/          # Gate logs, visitor management
├── documents/         # File metadata and references
├── notifications/     # System notifications and alerts
└── audit_logs/        # System audit trail
```

### 2.2 Data Modeling Principles

#### Document Design Patterns
1. **Embedded Documents**: For one-to-few relationships (e.g., order items)
2. **References**: For one-to-many relationships (e.g., company to orders)
3. **Hybrid Approach**: For complex relationships with frequent queries

#### Indexing Strategy
```javascript
// Performance-critical indexes
db.inventory.createIndex({ "companyId": 1, "category": 1, "status": 1 })
db.orders.createIndex({ "companyId": 1, "customerId": 1, "status": 1 })
db.production.createIndex({ "companyId": 1, "orderId": 1, "stage": 1 })
db.financial.createIndex({ "companyId": 1, "type": 1, "date": -1 })

// Text search indexes
db.inventory.createIndex({ "name": "text", "description": "text" })
db.orders.createIndex({ "customerName": "text", "orderNumber": "text" })
```

## 3. API Architecture

### 3.1 RESTful API Design

#### Base URL Structure
```
https://api.factoryerp.com/v1/
├── /auth/              # Authentication endpoints
├── /companies/         # Company management
├── /inventory/         # Inventory operations
├── /production/        # Production tracking
├── /orders/           # Order management
├── /financial/        # Financial operations
├── /security/         # Security and gate management
├── /reports/          # Analytics and reporting
├── /notifications/    # Notification management
└── /integrations/     # Third-party integrations
```

#### API Endpoint Examples
```javascript
// Inventory Management
GET    /api/v1/inventory?companyId=123&category=raw_material
POST   /api/v1/inventory
PUT    /api/v1/inventory/:id
DELETE /api/v1/inventory/:id

// Production Tracking
GET    /api/v1/production/status?companyId=123
POST   /api/v1/production/start
PUT    /api/v1/production/:id/update-stage
GET    /api/v1/production/reports/daily

// Order Management
GET    /api/v1/orders?status=pending&companyId=123
POST   /api/v1/orders
PUT    /api/v1/orders/:id/dispatch
GET    /api/v1/orders/:id/tracking
```

### 3.2 Authentication & Authorization

#### JWT Token Structure
```javascript
{
  "userId": "user_id",
  "companyId": "company_id",
  "role": "owner|manager|accountant|staff",
  "permissions": ["inventory:read", "production:write", ...],
  "exp": 1234567890,
  "iat": 1234567890
}
```

#### Role-Based Access Control (RBAC)
```javascript
const permissions = {
  owner: ["*"], // All permissions
  manager: ["inventory:*", "production:*", "orders:read"],
  accountant: ["financial:*", "orders:read", "reports:read"],
  staff: ["inventory:read", "production:update"]
};
```

## 4. Security Architecture

### 4.1 Security Layers

#### Application Security
- **Input Validation**: Joi/Yup schema validation
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Content Security Policy (CSP)
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Rate Limiting**: Express-rate-limit middleware

#### Data Security
- **Encryption at Rest**: MongoDB encryption
- **Encryption in Transit**: TLS 1.3 for all communications
- **Sensitive Data**: bcrypt for passwords, crypto for PII
- **Backup Encryption**: Encrypted database backups

#### Infrastructure Security
- **Network Security**: VPC with private subnets
- **Firewall Rules**: Restrictive security groups
- **SSL Certificates**: Let's Encrypt or commercial SSL
- **Monitoring**: Security event logging and alerting

### 4.2 Audit & Compliance

#### Audit Trail
```javascript
// Audit log structure
{
  userId: ObjectId,
  companyId: ObjectId,
  action: "CREATE|UPDATE|DELETE|VIEW",
  resource: "inventory|order|production",
  resourceId: ObjectId,
  changes: { before: {}, after: {} },
  timestamp: Date,
  ipAddress: String,
  userAgent: String
}
```

## 5. Integration Architecture

### 5.1 Third-Party Integrations

#### Accounting Software Integration
```javascript
// Tally Integration
POST /api/v1/integrations/tally/sync-transactions
GET  /api/v1/integrations/tally/status

// Zoho Books Integration  
POST /api/v1/integrations/zoho/sync-invoices
GET  /api/v1/integrations/zoho/customers
```

#### E-commerce Platform Integration
```javascript
// Meesho Integration
GET  /api/v1/integrations/meesho/orders
POST /api/v1/integrations/meesho/update-inventory

// IndiaMart Integration
GET  /api/v1/integrations/indiamart/leads
POST /api/v1/integrations/indiamart/quotations
```

#### Courier Service Integration
```javascript
// Multi-courier API wrapper
POST /api/v1/integrations/courier/create-shipment
GET  /api/v1/integrations/courier/track/:awb
POST /api/v1/integrations/courier/cancel-shipment
```

### 5.2 Webhook Architecture

#### Incoming Webhooks
```javascript
// Order status updates from e-commerce platforms
POST /api/v1/webhooks/orders/status-update
POST /api/v1/webhooks/payments/confirmation
POST /api/v1/webhooks/courier/delivery-update
```

#### Outgoing Webhooks
```javascript
// Notify external systems of internal changes
POST https://client-system.com/webhooks/inventory-update
POST https://client-system.com/webhooks/order-dispatch
POST https://client-system.com/webhooks/production-complete
```

## 6. Performance Architecture

### 6.1 Caching Strategy

#### Redis Caching Layers
```javascript
// Application-level caching
const cacheKeys = {
  userPermissions: `user:${userId}:permissions`,
  companySettings: `company:${companyId}:settings`,
  inventoryCount: `inventory:${companyId}:count`,
  productionStatus: `production:${companyId}:status`
};

// Cache TTL configuration
const cacheTTL = {
  userPermissions: 3600,    // 1 hour
  companySettings: 86400,   // 24 hours
  inventoryCount: 300,      // 5 minutes
  productionStatus: 60      // 1 minute
};
```

#### Database Query Optimization
```javascript
// Aggregation pipeline optimization
db.orders.aggregate([
  { $match: { companyId: ObjectId("..."), status: "pending" } },
  { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } },
  { $project: { orderNumber: 1, customerName: "$customer.name", totalAmount: 1 } },
  { $sort: { createdAt: -1 } },
  { $limit: 50 }
]);
```

### 6.2 Scalability Considerations

#### Horizontal Scaling
- **Load Balancing**: NGINX/HAProxy for request distribution
- **Database Sharding**: MongoDB sharding by company and date
- **Microservices**: Independent scaling of service components
- **CDN**: CloudFront/CloudFlare for static asset delivery

#### Vertical Scaling
- **Resource Monitoring**: CPU, memory, disk usage tracking
- **Auto-scaling**: Cloud provider auto-scaling groups
- **Performance Tuning**: Database query optimization
- **Connection Pooling**: MongoDB connection pool management

## 7. Monitoring & Observability

### 7.1 Application Monitoring

#### Metrics Collection
```javascript
// Key performance indicators
const metrics = {
  responseTime: "Average API response time",
  throughput: "Requests per second",
  errorRate: "Error percentage",
  activeUsers: "Concurrent user sessions",
  databaseConnections: "Active DB connections"
};
```

#### Health Check Endpoints
```javascript
GET /api/v1/health/status      // Overall system health
GET /api/v1/health/database    // Database connectivity
GET /api/v1/health/redis       // Cache connectivity
GET /api/v1/health/integrations // Third-party service status
```

### 7.2 Logging Strategy

#### Structured Logging
```javascript
// Log levels and structure
const logLevels = {
  error: "System errors and exceptions",
  warn: "Warning conditions",
  info: "General information",
  debug: "Debug information"
};

// Log format
{
  timestamp: "2024-01-15T10:30:00Z",
  level: "info",
  service: "inventory-service",
  userId: "user_123",
  companyId: "company_456",
  action: "create_inventory_item",
  message: "New inventory item created",
  metadata: { itemId: "item_789", category: "raw_material" }
}
```

## 8. Deployment Architecture

### 8.1 Environment Strategy

#### Environment Configuration
```yaml
# Development Environment
development:
  database: mongodb://localhost:27017/factory_erp_dev
  redis: redis://localhost:6379
  fileStorage: local
  
# Staging Environment  
staging:
  database: mongodb+srv://staging-cluster/factory_erp_staging
  redis: redis://staging-redis:6379
  fileStorage: s3://factory-erp-staging-files

# Production Environment
production:
  database: mongodb+srv://prod-cluster/factory_erp_prod
  redis: redis://prod-redis-cluster:6379
  fileStorage: s3://factory-erp-prod-files
```

### 8.2 Container Strategy

#### Docker Configuration
```dockerfile
# Multi-stage build for production optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose Setup
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URI=${REDIS_URI}
    depends_on:
      - mongodb
      - redis
      
  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      
  redis:
    image: redis:7.0-alpine
    volumes:
      - redis_data:/data
```

This architecture provides a solid foundation for the Factory ERP system with scalability, security, and maintainability in mind.
