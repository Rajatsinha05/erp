# Factory ERP System - Complete Flow Diagrams

## 🔄 Master System Architecture Flow

### Overall System Flow
```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application]
        MOB[Mobile App]
        ADM[Admin Panel]
    end
    
    subgraph "API Gateway Layer"
        GW[API Gateway]
        AUTH[Authentication]
        RATE[Rate Limiting]
    end
    
    subgraph "Microservices Layer"
        INV[Inventory Service]
        PROD[Production Service]
        ORD[Order Service]
        FIN[Financial Service]
        SEC[Security Service]
        HR[HR Service]
        QC[Quality Service]
        RPT[Report Service]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
        FILES[File Storage]
        LOGS[Log Storage]
    end
    
    subgraph "External Integrations"
        TALLY[Tally]
        SMS[SMS Gateway]
        EMAIL[Email Service]
        WHATSAPP[WhatsApp API]
        COURIER[Courier APIs]
    end
    
    WEB --> GW
    MOB --> GW
    ADM --> GW
    
    GW --> AUTH
    GW --> RATE
    
    AUTH --> INV
    AUTH --> PROD
    AUTH --> ORD
    AUTH --> FIN
    AUTH --> SEC
    AUTH --> HR
    AUTH --> QC
    AUTH --> RPT
    
    INV --> PG
    PROD --> PG
    ORD --> PG
    FIN --> PG
    SEC --> PG
    HR --> PG
    QC --> PG
    RPT --> PG
    
    INV --> REDIS
    PROD --> REDIS
    ORD --> REDIS
    
    RPT --> FILES
    QC --> FILES
    
    FIN --> TALLY
    ORD --> SMS
    ORD --> EMAIL
    ORD --> WHATSAPP
    ORD --> COURIER
```

## 📦 Complete Order to Dispatch Flow

### Detailed Order Processing Flow
```mermaid
graph TD
    A[Customer Inquiry] --> B[Quotation Generation]
    B --> C[Customer Approval]
    C --> D[Order Creation]
    D --> E[Order Validation]
    E --> F{Credit Check}
    F -->|Failed| G[Credit Approval Required]
    F -->|Passed| H[Inventory Availability Check]
    G --> I[Management Approval]
    I --> H
    H --> J{Stock Available?}
    J -->|No| K[Raw Material Planning]
    J -->|Yes| L[Production Planning]
    K --> M[Purchase Requisition]
    M --> N[Supplier Selection]
    N --> O[Purchase Order Creation]
    O --> P[Material Receipt]
    P --> Q[Quality Inspection]
    Q --> R{Quality OK?}
    R -->|No| S[Return to Supplier]
    R -->|Yes| T[Stock Update]
    T --> L
    S --> N
    L --> U[Production Order Creation]
    U --> V[Machine Allocation]
    V --> W[Operator Assignment]
    W --> X[Material Issue]
    X --> Y[Production Start]
    Y --> Z[Process Monitoring]
    Z --> AA[Quality Checks]
    AA --> BB{Quality Pass?}
    BB -->|No| CC[Rework/Rejection]
    BB -->|Yes| DD[Finished Goods Receipt]
    CC --> Y
    DD --> EE[Final Quality Inspection]
    EE --> FF{Final QC Pass?}
    FF -->|No| GG[Hold/Rework]
    FF -->|Yes| HH[Packing]
    GG --> EE
    HH --> II[Invoice Generation]
    II --> JJ[Dispatch Planning]
    JJ --> KK[Gate Pass Creation]
    KK --> LL[Vehicle Loading]
    LL --> MM[Security Check]
    MM --> NN[Dispatch]
    NN --> OO[Tracking Update]
    OO --> PP[Delivery Confirmation]
    PP --> QQ[Payment Collection]
    QQ --> RR[Order Closure]
```

## 🏭 Production Process Flow

### Detailed Production Workflow
```mermaid
graph TD
    A[Production Order] --> B[Material Requirement Planning]
    B --> C[Raw Material Allocation]
    C --> D[Design Preparation]
    D --> E[Screen Making]
    E --> F[Color Preparation]
    F --> G[Machine Setup]
    G --> H[Trial Run]
    H --> I{Trial OK?}
    I -->|No| J[Adjustments]
    I -->|Yes| K[Production Start]
    J --> H
    K --> L[Printing Process]
    L --> M[Drying]
    M --> N[Steaming]
    N --> O[Washing]
    O --> P[Color Fixing]
    P --> Q[Final Washing]
    Q --> R[Finishing]
    R --> S[Quality Check]
    S --> T{Quality Pass?}
    T -->|No| U[Rework]
    T -->|Yes| V[Folding/Rolling]
    U --> L
    V --> W[Packing]
    W --> X[Labeling]
    X --> Y[Stock Update]
    Y --> Z[Production Completion]
```

## 💰 Financial Process Flow

### Complete Financial Workflow
```mermaid
graph TD
    A[Transaction Initiation] --> B{Transaction Type}
    B -->|Sales| C[Customer Payment]
    B -->|Purchase| D[Supplier Payment]
    B -->|Expense| E[Expense Payment]
    B -->|Salary| F[Salary Payment]
    
    C --> G[Payment Verification]
    D --> H[Purchase Verification]
    E --> I[Expense Approval]
    F --> J[Salary Calculation]
    
    G --> K[Bank Reconciliation]
    H --> K
    I --> K
    J --> K
    
    K --> L[Account Update]
    L --> M[GST Calculation]
    M --> N[TDS Calculation]
    N --> O[Financial Reports]
    O --> P[Tally Integration]
    P --> Q[Compliance Reports]
```

## 🔐 Security Management Flow

### Complete Security Workflow
```mermaid
graph TD
    A[Security Event] --> B{Event Type}
    B -->|Visitor| C[Visitor Registration]
    B -->|Vehicle| D[Vehicle Entry]
    B -->|Material| E[Material Movement]
    B -->|Emergency| F[Emergency Response]
    
    C --> G[ID Verification]
    G --> H[Photo Capture]
    H --> I[Badge Issue]
    I --> J[Entry Log]
    J --> K[Notification to Host]
    K --> L[Visit Monitoring]
    L --> M[Exit Process]
    M --> N[Badge Return]
    N --> O[Exit Log]
    
    D --> P[Driver Verification]
    P --> Q[Vehicle Inspection]
    Q --> R[Gate Pass Check]
    R --> S[Entry Permission]
    S --> T[Parking Allocation]
    T --> U[Loading/Unloading]
    U --> V[Exit Inspection]
    V --> W[Gate Pass Verification]
    W --> X[Exit Permission]
    
    E --> Y[Material Verification]
    Y --> Z[Gate Pass Creation]
    Z --> AA[Approval Process]
    AA --> BB[Material Movement]
    BB --> CC[Movement Log]
    
    F --> DD[Alert Generation]
    DD --> EE[Emergency Team Notification]
    EE --> FF[Response Coordination]
    FF --> GG[Incident Logging]
```

## 📊 Inventory Management Flow

### Complete Inventory Workflow
```mermaid
graph TD
    A[Inventory Transaction] --> B{Transaction Type}
    B -->|Receipt| C[Goods Receipt]
    B -->|Issue| D[Material Issue]
    B -->|Transfer| E[Stock Transfer]
    B -->|Adjustment| F[Stock Adjustment]
    
    C --> G[Quality Inspection]
    G --> H{Quality OK?}
    H -->|No| I[Rejection/Return]
    H -->|Yes| J[Location Assignment]
    J --> K[Stock Update]
    K --> L[Batch Creation]
    L --> M[Label Generation]
    
    D --> N[Requirement Verification]
    N --> O[Stock Availability Check]
    O --> P{Stock Available?}
    P -->|No| Q[Backorder Creation]
    P -->|Yes| R[Material Issue]
    R --> S[Stock Deduction]
    S --> T[Issue Documentation]
    
    E --> U[Source Location Check]
    U --> V[Destination Verification]
    V --> W[Transfer Authorization]
    W --> X[Physical Movement]
    X --> Y[Stock Update Both Locations]
    
    F --> Z[Variance Analysis]
    Z --> AA[Approval Required]
    AA --> BB[Stock Correction]
    BB --> CC[Adjustment Documentation]
    
    K --> DD[Reorder Point Check]
    S --> DD
    Y --> DD
    BB --> DD
    DD --> EE{Below Reorder Point?}
    EE -->|Yes| FF[Purchase Requisition]
    EE -->|No| GG[Continue Operations]
```

## 👥 HR & Payroll Flow

### Complete HR Management Workflow
```mermaid
graph TD
    A[Employee Management] --> B{Process Type}
    B -->|Attendance| C[Attendance Capture]
    B -->|Leave| D[Leave Management]
    B -->|Payroll| E[Salary Processing]
    B -->|Performance| F[Performance Review]
    
    C --> G[Biometric/Manual Entry]
    G --> H[Validation]
    H --> I[Overtime Calculation]
    I --> J[Attendance Report]
    
    D --> K[Leave Application]
    K --> L[Manager Approval]
    L --> M{Approved?}
    M -->|No| N[Rejection Notification]
    M -->|Yes| O[Leave Balance Update]
    O --> P[Calendar Update]
    
    E --> Q[Attendance Data]
    Q --> R[Leave Data]
    R --> S[Overtime Calculation]
    S --> T[Deduction Calculation]
    T --> U[Net Salary Calculation]
    U --> V[Payroll Generation]
    V --> W[Bank File Creation]
    W --> X[Salary Slip Generation]
    
    F --> Y[Goal Setting]
    Y --> Z[Performance Tracking]
    Z --> AA[Review Meeting]
    AA --> BB[Rating Assignment]
    BB --> CC[Development Plan]
```

## 🔄 Integration Flow

### External System Integration
```mermaid
graph TD
    A[ERP System] --> B[Integration Hub]
    B --> C{Integration Type}
    
    C -->|Accounting| D[Tally Integration]
    C -->|Communication| E[WhatsApp/SMS]
    C -->|Logistics| F[Courier Integration]
    C -->|Banking| G[Bank Integration]
    C -->|E-commerce| H[Platform Integration]
    
    D --> I[Chart of Accounts Sync]
    I --> J[Transaction Sync]
    J --> K[Report Generation]
    
    E --> L[Template Management]
    L --> M[Message Queue]
    M --> N[Delivery Status]
    
    F --> O[Shipment Creation]
    O --> P[Tracking Updates]
    P --> Q[Delivery Confirmation]
    
    G --> R[Account Balance Sync]
    R --> S[Transaction Import]
    S --> T[Reconciliation]
    
    H --> U[Order Import]
    U --> V[Inventory Sync]
    V --> W[Status Updates]
```

This comprehensive flow documentation covers all major business processes in the Factory ERP system with detailed workflows for each module.
