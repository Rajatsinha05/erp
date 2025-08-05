# Factory ERP System - Database Models & Schema

## 🗄️ Database Architecture Overview

### Core Entity Relationships
```
Companies → Users → Roles → Permissions
Companies → Warehouses → Inventory → Products
Orders → OrderItems → Production → Dispatch
Customers → Orders → Payments → Invoices
Suppliers → Purchases → Inventory
```

## 📊 Core Database Models

### 1. 🏢 Company Management

#### Companies
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(15),
    pan_number VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    two_fa_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Roles & Permissions
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id),
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT
);
```

### 2. 📦 Product & Inventory Management

#### Product Categories
```sql
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES product_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Products
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    category_id UUID REFERENCES product_categories(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_type ENUM('raw_material', 'semi_finished', 'finished_goods'),
    design_code VARCHAR(100),
    color VARCHAR(100),
    gsm INTEGER,
    unit_of_measure VARCHAR(20),
    minimum_stock_level INTEGER DEFAULT 0,
    maximum_stock_level INTEGER,
    reorder_point INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Warehouses
```sql
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    manager_id UUID REFERENCES users(id),
    warehouse_type ENUM('main', 'raw_material', 'finished_goods', 'chemical_store'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Inventory
```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    quantity_available DECIMAL(15,3) DEFAULT 0,
    quantity_reserved DECIMAL(15,3) DEFAULT 0,
    quantity_in_transit DECIMAL(15,3) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);
```

#### Stock Movements
```sql
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    movement_type ENUM('in', 'out', 'transfer', 'adjustment'),
    quantity DECIMAL(15,3) NOT NULL,
    reference_type ENUM('purchase', 'sale', 'production', 'adjustment', 'transfer'),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 👥 Customer & Supplier Management

#### Customers
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(15),
    customer_type ENUM('domestic', 'export'),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Suppliers
```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(15),
    supplier_type ENUM('raw_material', 'chemical', 'packing', 'service'),
    payment_terms INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. 📋 Order Management

#### Orders
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_id UUID REFERENCES customers(id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE,
    order_status ENUM('pending', 'confirmed', 'in_production', 'ready', 'dispatched', 'delivered', 'cancelled'),
    order_type ENUM('domestic', 'export'),
    priority ENUM('low', 'medium', 'high', 'urgent'),
    total_amount DECIMAL(15,2),
    advance_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2),
    payment_status ENUM('pending', 'partial', 'paid'),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Order Items
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    production_status ENUM('pending', 'in_progress', 'completed'),
    design_specifications JSONB,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. 🏭 Production Management

#### Production Orders
```sql
CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    order_item_id UUID REFERENCES order_items(id),
    production_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id),
    quantity_to_produce DECIMAL(15,3) NOT NULL,
    quantity_produced DECIMAL(15,3) DEFAULT 0,
    production_status ENUM('pending', 'in_progress', 'completed', 'on_hold'),
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    machine_type ENUM('table_printing', 'machine_printing'),
    job_work_type ENUM('in_house', 'third_party'),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Production Processes
```sql
CREATE TABLE production_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_order_id UUID REFERENCES production_orders(id),
    process_name ENUM('printing', 'stitching', 'washing', 'silicate', 'color_fixing', 'finishing'),
    process_status ENUM('pending', 'in_progress', 'completed', 'skipped'),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    operator_id UUID REFERENCES users(id),
    machine_id UUID REFERENCES machines(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Machines
```sql
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    machine_type ENUM('printing', 'stitching', 'washing', 'finishing'),
    capacity_per_hour DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    maintenance_schedule JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. 🚚 Purchase Management

#### Purchase Orders
```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    supplier_id UUID REFERENCES suppliers(id),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    po_date DATE NOT NULL,
    expected_delivery_date DATE,
    po_status ENUM('draft', 'sent', 'confirmed', 'received', 'cancelled'),
    total_amount DECIMAL(15,2),
    advance_paid DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2),
    payment_status ENUM('pending', 'partial', 'paid'),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Purchase Order Items
```sql
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    received_quantity DECIMAL(15,3) DEFAULT 0,
    pending_quantity DECIMAL(15,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. 💰 Financial Management

#### Bank Accounts
```sql
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    ifsc_code VARCHAR(20),
    account_type ENUM('savings', 'current', 'cc', 'od'),
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    bank_account_id UUID REFERENCES bank_accounts(id),
    transaction_type ENUM('debit', 'credit'),
    amount DECIMAL(15,2) NOT NULL,
    transaction_mode ENUM('cash', 'bank', 'upi', 'cheque', 'card'),
    reference_number VARCHAR(100),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Expenses
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    expense_category ENUM('electricity', 'manpower', 'hospitality', 'maintenance', 'office', 'other'),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    payment_mode ENUM('cash', 'bank', 'upi', 'cheque'),
    receipt_number VARCHAR(100),
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 Relationships & Constraints

### Key Foreign Key Relationships
- All entities linked to companies for multi-tenant support
- Users have roles with specific permissions
- Products categorized and tracked in warehouses
- Orders linked to customers and broken into items
- Production orders tied to order items
- Stock movements track all inventory changes
- Financial transactions linked to bank accounts

### Data Integrity Constraints
- Unique constraints on codes and numbers
- Check constraints for positive quantities and amounts
- Enum constraints for status fields
- Cascade deletes where appropriate
- Audit trails with created_at/updated_at timestamps

## 📈 Indexing Strategy

### Primary Indexes
```sql
-- Performance indexes for frequent queries
CREATE INDEX idx_products_company_category ON products(company_id, category_id);
CREATE INDEX idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
CREATE INDEX idx_orders_company_status ON orders(company_id, order_status);
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, created_at);
CREATE INDEX idx_transactions_company_date ON transactions(company_id, transaction_date);
```

### Search Indexes
```sql
-- Full-text search indexes
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_customers_search ON customers USING gin(to_tsvector('english', name || ' ' || contact_person));
```

### 8. 🔐 Security & Safety Management

#### Security Guards
```sql
CREATE TABLE security_guards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    guard_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    shift_type ENUM('day', 'night', 'rotating'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Guard Attendance
```sql
CREATE TABLE guard_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guard_id UUID REFERENCES security_guards(id),
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    attendance_type ENUM('biometric', 'manual'),
    duty_location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Vehicle Logs
```sql
CREATE TABLE vehicle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    vehicle_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    purpose ENUM('delivery', 'pickup', 'maintenance', 'visitor'),
    gate_pass_number VARCHAR(100),
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Visitor Management
```sql
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    visitor_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    company_name VARCHAR(255),
    purpose_of_visit TEXT,
    person_to_meet VARCHAR(255),
    department VARCHAR(100),
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    badge_number VARCHAR(50),
    photo_url VARCHAR(500),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Material Gate Pass
```sql
CREATE TABLE material_gate_pass (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    pass_number VARCHAR(100) UNIQUE NOT NULL,
    pass_type ENUM('inward', 'outward', 'returnable'),
    material_description TEXT,
    quantity DECIMAL(15,3),
    vehicle_number VARCHAR(50),
    driver_name VARCHAR(255),
    purpose TEXT,
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Safety Equipment
```sql
CREATE TABLE safety_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    equipment_type ENUM('fire_extinguisher', 'first_aid_kit', 'safety_helmet', 'safety_gloves', 'safety_shoes'),
    equipment_code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255),
    last_inspection_date DATE,
    next_inspection_date DATE,
    status ENUM('active', 'maintenance', 'expired'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### CCTV Monitoring
```sql
CREATE TABLE cctv_cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    camera_code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    camera_type VARCHAR(100),
    risk_zone ENUM('low', 'medium', 'high'),
    is_active BOOLEAN DEFAULT true,
    last_health_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. ⚡ Utility Management

#### Electricity Consumption
```sql
CREATE TABLE electricity_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    meter_number VARCHAR(50),
    reading_date DATE NOT NULL,
    units_consumed DECIMAL(10,2),
    bill_amount DECIMAL(15,2),
    source_type ENUM('pgvcl', 'solar'),
    bill_number VARCHAR(100),
    due_date DATE,
    payment_status ENUM('pending', 'paid'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Employee Management
```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    salary DECIMAL(15,2),
    shift_type ENUM('day', 'night', 'general'),
    joining_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Hospitality Expenses
```sql
CREATE TABLE hospitality_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_id UUID REFERENCES customers(id),
    expense_type ENUM('hotel', 'food', 'gifts', 'transport'),
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    purpose TEXT,
    location VARCHAR(255),
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. 📄 Document Management

#### Documents
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    document_type ENUM('invoice', 'packing_list', 'courier_slip', 'sample_photo', 'fabric_image', 'po', 'contract'),
    reference_type ENUM('order', 'purchase', 'customer', 'supplier', 'product'),
    reference_id UUID,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES users(id),
    notification_type ENUM('order', 'stock', 'dispatch', 'payment', 'system'),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    priority ENUM('low', 'medium', 'high'),
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

This comprehensive database schema provides a solid foundation for the Factory ERP system with proper normalization, relationships, and performance considerations.
