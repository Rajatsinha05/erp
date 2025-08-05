# Factory ERP System - Architecture & Flow Documentation

## 🏗️ System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Web App   │  │ Mobile App  │  │   Admin     │     │
│  │  (React)    │  │(React Native│  │   Panel     │     │
│  └─────────────┘  │/Flutter)    │  └─────────────┘     │
│                   └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Load Balancer │
                    │   (Nginx)      │
                    └───────┬───────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                 Application Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   API       │  │   Auth      │  │ Notification│     │
│  │  Gateway    │  │  Service    │  │  Service    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Inventory   │  │ Production  │  │  Financial  │     │
│  │  Service    │  │  Service    │  │   Service   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Order     │  │  Security   │  │   Report    │     │
│  │  Service    │  │  Service    │  │  Service    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ PostgreSQL  │  │    Redis    │  │   File      │     │
│  │ (Primary DB)│  │   (Cache)   │  │  Storage    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Core Business Flows

### 1. Order to Dispatch Flow
```mermaid
graph TD
    A[Customer Places Order] --> B[Order Validation]
    B --> C[Inventory Check]
    C --> D{Stock Available?}
    D -->|Yes| E[Create Production Order]
    D -->|No| F[Purchase Raw Materials]
    F --> G[Update Inventory]
    G --> E
    E --> H[Assign to Production]
    H --> I[Start Production Process]
    I --> J[Printing]
    J --> K[Washing]
    K --> L[Finishing]
    L --> M[Quality Check]
    M --> N{Quality OK?}
    N -->|No| O[Rework]
    O --> M
    N -->|Yes| P[Update Finished Goods]
    P --> Q[Generate Invoice]
    Q --> R[Prepare Dispatch]
    R --> S[Create Gate Pass]
    S --> T[Dispatch to Customer]
    T --> U[Update Order Status]
```

### 2. Inventory Management Flow
```mermaid
graph TD
    A[Raw Material Purchase] --> B[Goods Receipt]
    B --> C[Quality Inspection]
    C --> D{Quality OK?}
    D -->|No| E[Return to Supplier]
    D -->|Yes| F[Update Inventory]
    F --> G[Stock Location Assignment]
    G --> H[Generate Stock Movement]
    H --> I[Update Stock Levels]
    I --> J{Below Reorder Point?}
    J -->|Yes| K[Generate Purchase Requisition]
    J -->|No| L[Continue Operations]
    K --> M[Approve Purchase]
    M --> N[Create Purchase Order]
    N --> A
```

### 3. Production Planning Flow
```mermaid
graph TD
    A[Order Received] --> B[Check Production Capacity]
    B --> C[Material Requirement Planning]
    C --> D{Materials Available?}
    D -->|No| E[Generate Purchase Request]
    D -->|Yes| F[Schedule Production]
    E --> F
    F --> G[Assign Machines]
    G --> H[Assign Operators]
    H --> I[Create Work Orders]
    I --> J[Start Production]
    J --> K[Monitor Progress]
    K --> L[Update Production Status]
    L --> M{Production Complete?}
    M -->|No| K
    M -->|Yes| N[Quality Control]
    N --> O[Move to Finished Goods]
```

## 🔐 Security & Access Control Flow

### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant D as Database
    
    U->>F: Login Request
    F->>A: Validate Credentials
    A->>D: Check User Data
    D-->>A: User Info + Permissions
    A-->>F: JWT Token + User Data
    F-->>U: Login Success
    
    Note over U,D: Subsequent Requests
    U->>F: API Request
    F->>A: Validate Token
    A-->>F: Token Valid + Permissions
    F->>F: Check Route Permissions
    F-->>U: Authorized Response
```

### Role-Based Access Control
```
Owner (Full Access)
├── Financial Management ✓
├── Production Management ✓
├── Inventory Management ✓
├── Order Management ✓
├── Security Management ✓
├── User Management ✓
└── Reports & Analytics ✓

Factory Manager
├── Production Management ✓
├── Inventory Management ✓ (View Only)
├── Order Management ✓ (Production Related)
├── Security Management ✓ (Factory Floor)
└── Reports ✓ (Production Reports)

Accountant
├── Financial Management ✓
├── Order Management ✓ (Billing Related)
├── Purchase Management ✓
└── Financial Reports ✓

Security Guard
├── Security Management ✓ (Limited)
├── Visitor Management ✓
├── Vehicle Logs ✓
└── Gate Pass ✓
```

## 📊 Data Flow Architecture

### Real-time Data Synchronization
```mermaid
graph LR
    A[User Action] --> B[Frontend]
    B --> C[API Gateway]
    C --> D[Microservice]
    D --> E[Database]
    D --> F[Cache Update]
    D --> G[Event Bus]
    G --> H[Notification Service]
    G --> I[Real-time Updates]
    I --> J[WebSocket]
    J --> B
    H --> K[Email/SMS/WhatsApp]
```

### Inventory Tracking Flow
```mermaid
graph TD
    A[Stock Movement] --> B[Update Inventory Table]
    B --> C[Create Stock Movement Record]
    C --> D[Update Cache]
    D --> E[Check Stock Levels]
    E --> F{Below Minimum?}
    F -->|Yes| G[Trigger Low Stock Alert]
    F -->|No| H[Continue]
    G --> I[Send Notification]
    I --> J[Update Dashboard]
    H --> J
```

## 🔄 Integration Flows

### Third-Party Integrations
```mermaid
graph TD
    A[ERP System] --> B[API Gateway]
    B --> C[Tally Integration]
    B --> D[WhatsApp API]
    B --> E[SMS Gateway]
    B --> F[Email Service]
    B --> G[Courier APIs]
    B --> H[Payment Gateways]
    
    C --> I[Accounting Sync]
    D --> J[Order Notifications]
    E --> K[Alert Messages]
    F --> L[Invoice Emails]
    G --> M[Tracking Updates]
    H --> N[Payment Processing]
```

### File Upload & Document Management
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as File Storage
    participant D as Database
    
    U->>F: Upload Document
    F->>A: POST /upload
    A->>S: Store File
    S-->>A: File URL
    A->>D: Save File Metadata
    D-->>A: Success
    A-->>F: Upload Complete
    F-->>U: Success Message
```

## 📱 Mobile App Architecture

### Mobile-Specific Flows
```mermaid
graph TD
    A[Mobile App Launch] --> B[Check Authentication]
    B --> C{Logged In?}
    C -->|No| D[Login Screen]
    C -->|Yes| E[Sync Local Data]
    D --> F[Authenticate]
    F --> E
    E --> G[Load Dashboard]
    G --> H[Enable Push Notifications]
    H --> I[Background Sync]
    I --> J[Offline Mode Support]
```

### Offline Capability
```mermaid
graph LR
    A[Online Mode] --> B[Sync Data]
    B --> C[Store Locally]
    C --> D[Network Lost]
    D --> E[Offline Mode]
    E --> F[Local Operations]
    F --> G[Queue Changes]
    G --> H[Network Restored]
    H --> I[Sync Queued Changes]
    I --> A
```

## 🚨 Error Handling & Recovery

### Error Flow
```mermaid
graph TD
    A[System Error] --> B[Log Error]
    B --> C[Categorize Error]
    C --> D{Critical Error?}
    D -->|Yes| E[Send Alert to Admin]
    D -->|No| F[Log for Review]
    E --> G[Attempt Auto-Recovery]
    G --> H{Recovery Successful?}
    H -->|No| I[Manual Intervention Required]
    H -->|Yes| J[Continue Operations]
    F --> J
    I --> K[Notify Support Team]
```

## 📈 Performance & Scalability

### Caching Strategy
```mermaid
graph TD
    A[User Request] --> B[Check Redis Cache]
    B --> C{Cache Hit?}
    C -->|Yes| D[Return Cached Data]
    C -->|No| E[Query Database]
    E --> F[Store in Cache]
    F --> G[Return Data]
    D --> H[Update Cache TTL]
    G --> I[Set Cache Expiry]
```

### Database Optimization
```
Read Replicas for Reports
├── Master Database (Write Operations)
├── Read Replica 1 (Dashboard Queries)
├── Read Replica 2 (Report Generation)
└── Read Replica 3 (Analytics)

Partitioning Strategy
├── Orders by Date (Monthly Partitions)
├── Stock Movements by Date (Weekly Partitions)
├── Transactions by Date (Monthly Partitions)
└── Logs by Date (Daily Partitions)
```

## 🔄 Backup & Recovery

### Backup Strategy
```mermaid
graph TD
    A[Daily Backup] --> B[Database Dump]
    B --> C[File Storage Backup]
    C --> D[Compress & Encrypt]
    D --> E[Upload to Cloud Storage]
    E --> F[Verify Backup Integrity]
    F --> G[Update Backup Log]
    G --> H[Cleanup Old Backups]
```

### Disaster Recovery
```
Recovery Time Objectives (RTO)
├── Critical Systems: 1 hour
├── Production Systems: 4 hours
├── Reporting Systems: 24 hours
└── Archive Systems: 72 hours

Recovery Point Objectives (RPO)
├── Financial Data: 15 minutes
├── Production Data: 1 hour
├── Inventory Data: 30 minutes
└── User Data: 4 hours
```

This architecture provides a robust, scalable foundation for the Factory ERP system with proper separation of concerns, security, and performance optimization.
