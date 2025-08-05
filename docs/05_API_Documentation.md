# Factory ERP System - API Documentation

## 🔗 API Overview

### Base URL
```
Production: https://api.factoryerp.com/v1
Staging: https://staging-api.factoryerp.com/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00Z",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔐 Authentication Endpoints

### POST /auth/login
Login user and get JWT token
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "company_id": "uuid"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "factory_manager",
      "permissions": ["inventory:read", "production:write"]
    },
    "expires_in": 86400
  }
}
```

### POST /auth/refresh
Refresh JWT token
```json
Request:
{
  "refresh_token": "refresh_token_here"
}

Response:
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expires_in": 86400
  }
}
```

### POST /auth/logout
Logout user and invalidate token
```json
Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 📦 Inventory Management APIs

### GET /inventory/products
Get list of products with filtering
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- category: string
- warehouse: string
- status: string (active|inactive)
- search: string

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "P001",
      "name": "Cotton Fabric",
      "category": "Raw Material",
      "current_stock": 150.5,
      "unit": "kg",
      "status": "active",
      "warehouse_stocks": [
        {
          "warehouse_id": "uuid",
          "warehouse_name": "Main Warehouse",
          "quantity": 100.5
        }
      ]
    }
  ],
  "pagination": {...}
}
```

### POST /inventory/products
Create new product
```json
Request:
{
  "sku": "P002",
  "name": "Printed Saree",
  "description": "Beautiful printed saree",
  "category_id": "uuid",
  "product_type": "finished_goods",
  "unit_of_measure": "pieces",
  "minimum_stock_level": 10,
  "design_code": "DS001",
  "color": "Red",
  "gsm": 120
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "sku": "P002",
    "name": "Printed Saree",
    ...
  }
}
```

### PUT /inventory/products/:id
Update product
```json
Request:
{
  "name": "Updated Product Name",
  "minimum_stock_level": 15
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Product Name",
    ...
  }
}
```

### POST /inventory/stock-movement
Record stock movement
```json
Request:
{
  "product_id": "uuid",
  "warehouse_id": "uuid",
  "movement_type": "in",
  "quantity": 50.0,
  "reference_type": "purchase",
  "reference_id": "uuid",
  "notes": "Received from supplier"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "movement_id": "SM001",
    "current_stock": 200.5
  }
}
```

## 🏭 Production Management APIs

### GET /production/orders
Get production orders
```
Query Parameters:
- status: string (pending|in_progress|completed)
- machine_type: string
- date_from: date
- date_to: date

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "production_number": "PRD001",
      "product": {
        "id": "uuid",
        "name": "Cotton Saree",
        "sku": "P001"
      },
      "quantity_to_produce": 100,
      "quantity_produced": 75,
      "status": "in_progress",
      "progress_percentage": 75,
      "processes": [
        {
          "name": "printing",
          "status": "completed",
          "start_time": "2024-01-15T08:00:00Z",
          "end_time": "2024-01-15T12:00:00Z"
        }
      ]
    }
  ]
}
```

### POST /production/orders
Create production order
```json
Request:
{
  "order_item_id": "uuid",
  "product_id": "uuid",
  "quantity_to_produce": 100,
  "expected_completion_date": "2024-01-20",
  "machine_type": "table_printing",
  "job_work_type": "in_house",
  "assigned_to": "uuid"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "production_number": "PRD002",
    "status": "pending"
  }
}
```

### PUT /production/orders/:id/process
Update production process
```json
Request:
{
  "process_name": "washing",
  "status": "completed",
  "operator_id": "uuid",
  "machine_id": "uuid",
  "notes": "Process completed successfully"
}

Response:
{
  "success": true,
  "data": {
    "process_id": "uuid",
    "status": "completed",
    "completion_time": "2024-01-15T16:00:00Z"
  }
}
```

## 📋 Order Management APIs

### GET /orders
Get orders list
```
Query Parameters:
- status: string
- customer_id: string
- order_type: string (domestic|export)
- date_from: date
- date_to: date

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD001",
      "customer": {
        "id": "uuid",
        "name": "ABC Textiles",
        "contact_person": "John Doe"
      },
      "order_date": "2024-01-15",
      "delivery_date": "2024-01-25",
      "status": "in_production",
      "total_amount": 50000.00,
      "items_count": 3,
      "production_progress": 65
    }
  ]
}
```

### POST /orders
Create new order
```json
Request:
{
  "customer_id": "uuid",
  "order_date": "2024-01-15",
  "delivery_date": "2024-01-25",
  "order_type": "domestic",
  "priority": "high",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 100,
      "unit_price": 500.00,
      "design_specifications": {
        "color": "Red",
        "pattern": "Floral"
      }
    }
  ],
  "notes": "Rush order for festival season"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "ORD002",
    "status": "pending",
    "total_amount": 50000.00
  }
}
```

### PUT /orders/:id/status
Update order status
```json
Request:
{
  "status": "dispatched",
  "notes": "Dispatched via Blue Dart",
  "tracking_details": {
    "courier_name": "Blue Dart",
    "awb_number": "BD123456789",
    "dispatch_date": "2024-01-20"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "dispatched",
    "updated_at": "2024-01-20T10:00:00Z"
  }
}
```

## 💰 Financial Management APIs

### GET /financial/transactions
Get financial transactions
```
Query Parameters:
- account_id: string
- transaction_type: string (debit|credit)
- date_from: date
- date_to: date

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 25000.00,
      "transaction_type": "credit",
      "transaction_mode": "bank",
      "description": "Payment received from customer",
      "transaction_date": "2024-01-15",
      "bank_account": {
        "account_name": "Business Account",
        "account_number": "****1234"
      }
    }
  ]
}
```

### POST /financial/transactions
Record new transaction
```json
Request:
{
  "bank_account_id": "uuid",
  "transaction_type": "credit",
  "amount": 15000.00,
  "transaction_mode": "upi",
  "reference_number": "UPI123456",
  "description": "Customer payment",
  "transaction_date": "2024-01-15"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "transaction_id": "TXN001",
    "current_balance": 125000.00
  }
}
```

### GET /financial/dashboard
Get financial dashboard data
```json
Response:
{
  "success": true,
  "data": {
    "total_revenue": 500000.00,
    "pending_payments": 75000.00,
    "today_expenses": 5000.00,
    "bank_balance": 125000.00,
    "monthly_trend": [
      {
        "month": "2024-01",
        "revenue": 450000.00,
        "expenses": 320000.00,
        "profit": 130000.00
      }
    ],
    "recent_transactions": [...],
    "payment_reminders": [...]
  }
}
```

## 🔐 Security Management APIs

### GET /security/visitors
Get visitor logs
```
Query Parameters:
- date: date
- status: string (in|out)

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "visitor_name": "John Smith",
      "contact_number": "+91-9876543210",
      "company_name": "ABC Corp",
      "purpose_of_visit": "Business meeting",
      "person_to_meet": "Manager",
      "entry_time": "2024-01-15T10:00:00Z",
      "exit_time": null,
      "badge_number": "V001",
      "status": "in"
    }
  ]
}
```

### POST /security/visitors
Register new visitor
```json
Request:
{
  "visitor_name": "Jane Doe",
  "contact_number": "+91-9876543210",
  "company_name": "XYZ Ltd",
  "purpose_of_visit": "Supplier meeting",
  "person_to_meet": "Purchase Manager",
  "department": "Purchase"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "badge_number": "V002",
    "entry_time": "2024-01-15T14:00:00Z"
  }
}
```

### PUT /security/visitors/:id/checkout
Check out visitor
```json
Request:
{
  "exit_time": "2024-01-15T17:00:00Z",
  "notes": "Meeting completed"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "exit_time": "2024-01-15T17:00:00Z",
    "duration": "3 hours"
  }
}
```

## 📊 Reports & Analytics APIs

### GET /reports/inventory-summary
Get inventory summary report
```
Query Parameters:
- warehouse_id: string
- category_id: string
- date: date

Response:
{
  "success": true,
  "data": {
    "total_products": 150,
    "total_value": 2500000.00,
    "low_stock_items": 12,
    "out_of_stock_items": 3,
    "categories": [
      {
        "category": "Raw Materials",
        "product_count": 50,
        "total_value": 800000.00
      }
    ]
  }
}
```

### GET /reports/production-summary
Get production summary report
```
Query Parameters:
- date_from: date
- date_to: date
- machine_id: string

Response:
{
  "success": true,
  "data": {
    "total_orders": 25,
    "completed_orders": 20,
    "in_progress_orders": 5,
    "total_production": 2500,
    "efficiency_percentage": 85.5,
    "machine_utilization": [
      {
        "machine_name": "Printing Machine 1",
        "utilization_percentage": 90.5,
        "total_hours": 160,
        "productive_hours": 145
      }
    ]
  }
}
```

## 🔔 Notification APIs

### GET /notifications
Get user notifications
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Low Stock Alert",
      "message": "Cotton fabric stock is below minimum level",
      "type": "stock",
      "priority": "high",
      "is_read": false,
      "created_at": "2024-01-15T10:00:00Z",
      "action_url": "/inventory/products/uuid"
    }
  ]
}
```

### PUT /notifications/:id/read
Mark notification as read
```json
Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

## 📱 Mobile-Specific APIs

### GET /mobile/dashboard
Get mobile dashboard data
```json
Response:
{
  "success": true,
  "data": {
    "quick_stats": {
      "orders_today": 5,
      "production_active": 8,
      "stock_alerts": 3,
      "revenue_today": 25000.00
    },
    "recent_activities": [...],
    "urgent_alerts": [...]
  }
}
```

This API documentation provides comprehensive endpoints for all major functionalities of the Factory ERP system with proper request/response formats and authentication.
