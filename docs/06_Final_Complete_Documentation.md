# Factory ERP System - Final Complete Documentation

## 🎯 Executive Summary

This comprehensive Factory ERP system is designed for **Dhruval Exim Private Limited**, **Jinal Industries (Amar)**, and **Vimal Process** to provide real-time tracking and management of their entire textile manufacturing operations.

## 🏢 Multi-Company Architecture

### Company-Wise Data Segregation
Every entity in the system is linked to a specific company for complete data isolation and multi-tenant support:

```sql
-- All tables include company_id for data segregation
company_id UUID REFERENCES companies(id) NOT NULL
```

### Company Hierarchy & Relationships
```
Dhruval Exim Private Limited (Parent)
├── Jinal Industries (Amar) (Subsidiary)
└── Vimal Process (Subsidiary)

Shared Resources:
├── Raw Materials Pool
├── Finished Goods Warehouse
├── Customer Database
└── Supplier Network
```

## 📊 Advanced Database Models with Company Tracking

### 1. Enhanced Company Management

#### Companies (Extended)
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    company_type ENUM('parent', 'subsidiary', 'division'),
    parent_company_id UUID REFERENCES companies(id),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(15),
    pan_number VARCHAR(10),
    cin_number VARCHAR(21),
    udyog_aadhar VARCHAR(12),
    factory_license VARCHAR(50),
    pollution_clearance VARCHAR(50),
    fire_safety_certificate VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Company Settings
```sql
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    setting_category ENUM('production', 'inventory', 'financial', 'security', 'notification'),
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, setting_category, setting_key)
);
```

### 2. Advanced Product & Inventory Models

#### Enhanced Products with Company Tracking
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    category_id UUID REFERENCES product_categories(id),
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_type ENUM('raw_material', 'semi_finished', 'finished_goods', 'consumable'),
    design_code VARCHAR(100),
    color VARCHAR(100),
    gsm INTEGER,
    width DECIMAL(10,2),
    length DECIMAL(10,2),
    weight DECIMAL(10,3),
    unit_of_measure VARCHAR(20),
    minimum_stock_level INTEGER DEFAULT 0,
    maximum_stock_level INTEGER,
    reorder_point INTEGER,
    lead_time_days INTEGER DEFAULT 0,
    shelf_life_days INTEGER,
    storage_conditions TEXT,
    quality_parameters JSONB,
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    tax_rate DECIMAL(5,2),
    hsn_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, sku)
);
```

#### Multi-Location Inventory Tracking
```sql
CREATE TABLE inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    warehouse_id UUID REFERENCES warehouses(id),
    location_code VARCHAR(50) NOT NULL,
    location_name VARCHAR(255),
    location_type ENUM('rack', 'bin', 'floor', 'cold_storage', 'chemical_store'),
    capacity DECIMAL(15,3),
    current_utilization DECIMAL(15,3) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, warehouse_id, location_code)
);

CREATE TABLE inventory_detailed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    product_id UUID REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    location_id UUID REFERENCES inventory_locations(id),
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE,
    quantity_available DECIMAL(15,3) DEFAULT 0,
    quantity_reserved DECIMAL(15,3) DEFAULT 0,
    quantity_damaged DECIMAL(15,3) DEFAULT 0,
    quality_status ENUM('good', 'damaged', 'expired', 'quarantine'),
    last_counted_date DATE,
    last_movement_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Advanced Order Management with Company Tracking

#### Enhanced Orders
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    order_number VARCHAR(100) NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE,
    promised_date DATE,
    order_status ENUM('draft', 'pending', 'confirmed', 'in_production', 'ready', 'dispatched', 'delivered', 'cancelled', 'returned'),
    order_type ENUM('domestic', 'export'),
    priority ENUM('low', 'medium', 'high', 'urgent'),
    sales_person_id UUID REFERENCES users(id),
    total_amount DECIMAL(15,2),
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    advance_amount DECIMAL(15,2) DEFAULT 0,
    balance_amount DECIMAL(15,2),
    payment_status ENUM('pending', 'partial', 'paid', 'overdue'),
    payment_terms INTEGER DEFAULT 30,
    shipping_address TEXT,
    billing_address TEXT,
    special_instructions TEXT,
    internal_notes TEXT,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, order_number)
);
```

#### Enhanced Order Items with Detailed Tracking
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    item_sequence INTEGER,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL,
    production_status ENUM('pending', 'in_progress', 'completed', 'on_hold'),
    design_specifications JSONB,
    color_specifications JSONB,
    size_specifications JSONB,
    quality_requirements JSONB,
    special_instructions TEXT,
    delivery_date DATE,
    production_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Advanced Production Management

#### Enhanced Production Orders
```sql
CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    order_item_id UUID REFERENCES order_items(id),
    production_number VARCHAR(100) NOT NULL,
    product_id UUID REFERENCES products(id),
    batch_size DECIMAL(15,3) NOT NULL,
    quantity_to_produce DECIMAL(15,3) NOT NULL,
    quantity_produced DECIMAL(15,3) DEFAULT 0,
    quantity_approved DECIMAL(15,3) DEFAULT 0,
    quantity_rejected DECIMAL(15,3) DEFAULT 0,
    production_status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled'),
    priority ENUM('low', 'medium', 'high', 'urgent'),
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    machine_type ENUM('table_printing', 'machine_printing', 'digital_printing'),
    job_work_type ENUM('in_house', 'third_party'),
    job_worker_id UUID REFERENCES suppliers(id),
    assigned_to UUID REFERENCES users(id),
    supervisor_id UUID REFERENCES users(id),
    shift_id UUID REFERENCES shifts(id),
    production_cost DECIMAL(15,2) DEFAULT 0,
    material_cost DECIMAL(15,2) DEFAULT 0,
    labor_cost DECIMAL(15,2) DEFAULT 0,
    overhead_cost DECIMAL(15,2) DEFAULT 0,
    quality_parameters JSONB,
    production_notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, production_number)
);
```

#### Detailed Production Process Tracking
```sql
CREATE TABLE production_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    production_order_id UUID REFERENCES production_orders(id),
    process_sequence INTEGER,
    process_name ENUM('design', 'screen_making', 'printing', 'drying', 'steaming', 'washing', 'silicate', 'color_fixing', 'finishing', 'quality_check', 'packing'),
    process_status ENUM('pending', 'in_progress', 'completed', 'skipped', 'failed'),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    planned_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    operator_id UUID REFERENCES users(id),
    machine_id UUID REFERENCES machines(id),
    input_quantity DECIMAL(15,3),
    output_quantity DECIMAL(15,3),
    wastage_quantity DECIMAL(15,3) DEFAULT 0,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    process_parameters JSONB,
    quality_checks JSONB,
    issues_encountered TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Machine Management with Company Tracking
```sql
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    machine_code VARCHAR(50) NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    machine_type ENUM('printing', 'stitching', 'washing', 'finishing', 'cutting', 'steaming'),
    machine_category ENUM('table_printing', 'rotary_printing', 'digital_printing', 'flat_bed', 'cylinder'),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    year_of_manufacture INTEGER,
    capacity_per_hour DECIMAL(10,2),
    power_consumption DECIMAL(10,2), -- in KW
    floor_area DECIMAL(10,2), -- in sq ft
    location VARCHAR(255),
    operator_required INTEGER DEFAULT 1,
    maintenance_frequency INTEGER DEFAULT 30, -- days
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    machine_status ENUM('active', 'maintenance', 'breakdown', 'idle'),
    efficiency_rating DECIMAL(5,2) DEFAULT 100.00,
    total_running_hours DECIMAL(15,2) DEFAULT 0,
    maintenance_cost_ytd DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    specifications JSONB,
    maintenance_schedule JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, machine_code)
);
```

### 5. Advanced Financial Management

#### Enhanced Bank Accounts
```sql
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    ifsc_code VARCHAR(20),
    swift_code VARCHAR(20),
    account_type ENUM('savings', 'current', 'cc', 'od', 'fd'),
    currency VARCHAR(3) DEFAULT 'INR',
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    available_balance DECIMAL(15,2) DEFAULT 0,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    minimum_balance DECIMAL(15,2) DEFAULT 0,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_reconciled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Detailed Transaction Tracking
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    transaction_number VARCHAR(100) NOT NULL,
    bank_account_id UUID REFERENCES bank_accounts(id),
    transaction_type ENUM('debit', 'credit'),
    amount DECIMAL(15,2) NOT NULL,
    transaction_mode ENUM('cash', 'bank', 'upi', 'cheque', 'card', 'neft', 'rtgs', 'imps'),
    reference_number VARCHAR(100),
    cheque_number VARCHAR(50),
    cheque_date DATE,
    utr_number VARCHAR(50),
    category ENUM('sales', 'purchase', 'expense', 'salary', 'loan', 'investment', 'tax', 'other'),
    subcategory VARCHAR(100),
    description TEXT,
    transaction_date DATE NOT NULL,
    value_date DATE,
    reconciliation_status ENUM('pending', 'reconciled', 'disputed'),
    reconciled_date DATE,
    reference_type ENUM('order', 'purchase', 'expense', 'salary', 'manual'),
    reference_id UUID,
    tax_applicable BOOLEAN DEFAULT false,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tds_applicable BOOLEAN DEFAULT false,
    tds_amount DECIMAL(15,2) DEFAULT 0,
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, transaction_number)
);
```

### 6. Advanced Employee & Manpower Management

#### Enhanced Employee Management
```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    blood_group VARCHAR(5),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    email VARCHAR(255),
    permanent_address TEXT,
    current_address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    aadhar_number VARCHAR(12),
    pan_number VARCHAR(10),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    pf_number VARCHAR(50),
    esi_number VARCHAR(50),
    designation VARCHAR(100),
    department VARCHAR(100),
    reporting_manager_id UUID REFERENCES employees(id),
    employment_type ENUM('permanent', 'contract', 'temporary', 'intern'),
    salary_type ENUM('monthly', 'daily', 'hourly', 'piece_rate'),
    basic_salary DECIMAL(15,2),
    hra DECIMAL(15,2) DEFAULT 0,
    da DECIMAL(15,2) DEFAULT 0,
    other_allowances DECIMAL(15,2) DEFAULT 0,
    pf_deduction DECIMAL(15,2) DEFAULT 0,
    esi_deduction DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    shift_type ENUM('day', 'night', 'general', 'rotating'),
    joining_date DATE,
    confirmation_date DATE,
    resignation_date DATE,
    last_working_date DATE,
    is_active BOOLEAN DEFAULT true,
    skills JSONB,
    certifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_code)
);
```

#### Shift Management
```sql
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    shift_code VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 0, -- in minutes
    overtime_threshold INTEGER DEFAULT 480, -- in minutes
    is_night_shift BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, shift_code)
);

CREATE TABLE employee_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    employee_id UUID REFERENCES employees(id),
    attendance_date DATE NOT NULL,
    shift_id UUID REFERENCES shifts(id),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    break_start_time TIMESTAMP,
    break_end_time TIMESTAMP,
    total_hours DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    attendance_status ENUM('present', 'absent', 'half_day', 'late', 'early_out'),
    attendance_type ENUM('biometric', 'manual', 'mobile'),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_id, attendance_date)
);
```

### 7. Advanced Security & Safety Management

#### Enhanced Security Guards Management
```sql
CREATE TABLE security_guards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    guard_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    date_of_birth DATE,
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    permanent_address TEXT,
    current_address TEXT,
    aadhar_number VARCHAR(12),
    police_verification_number VARCHAR(50),
    police_verification_date DATE,
    training_certificate VARCHAR(100),
    license_number VARCHAR(50),
    license_expiry_date DATE,
    shift_type ENUM('day', 'night', 'rotating'),
    duty_location VARCHAR(255),
    joining_date DATE,
    salary DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, guard_code)
);
```

#### Comprehensive Visitor Management
```sql
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    visitor_code VARCHAR(50) NOT NULL,
    visitor_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    company_name VARCHAR(255),
    visitor_type ENUM('customer', 'supplier', 'contractor', 'government', 'other'),
    purpose_of_visit TEXT,
    person_to_meet VARCHAR(255),
    department VARCHAR(100),
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    expected_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    badge_number VARCHAR(50),
    vehicle_number VARCHAR(50),
    photo_url VARCHAR(500),
    id_proof_type ENUM('aadhar', 'pan', 'driving_license', 'passport', 'voter_id'),
    id_proof_number VARCHAR(50),
    temperature_check DECIMAL(4,1),
    health_declaration BOOLEAN DEFAULT false,
    items_carried TEXT,
    security_clearance ENUM('pending', 'approved', 'rejected'),
    approved_by UUID REFERENCES users(id),
    guard_on_duty UUID REFERENCES security_guards(id),
    visit_rating INTEGER CHECK (visit_rating >= 1 AND visit_rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, visitor_code)
);
```

#### Advanced Vehicle Management
```sql
CREATE TABLE vehicle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    log_number VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_type ENUM('truck', 'tempo', 'car', 'bike', 'auto', 'other'),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    driver_license VARCHAR(50),
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    purpose ENUM('delivery', 'pickup', 'maintenance', 'visitor', 'employee', 'contractor'),
    material_description TEXT,
    weight_in DECIMAL(10,2),
    weight_out DECIMAL(10,2),
    gate_pass_number VARCHAR(100),
    invoice_number VARCHAR(100),
    po_number VARCHAR(100),
    supplier_id UUID REFERENCES suppliers(id),
    customer_id UUID REFERENCES customers(id),
    parking_location VARCHAR(100),
    security_check_status ENUM('pending', 'completed', 'failed'),
    documents_verified BOOLEAN DEFAULT false,
    recorded_by UUID REFERENCES users(id),
    guard_on_duty UUID REFERENCES security_guards(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, log_number)
);
```

### 8. Advanced Utility Management

#### Electricity Consumption Tracking
```sql
CREATE TABLE electricity_meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    meter_number VARCHAR(50) NOT NULL,
    meter_type ENUM('main', 'sub', 'solar'),
    location VARCHAR(255),
    capacity_kw DECIMAL(10,2),
    installation_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, meter_number)
);

CREATE TABLE electricity_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    meter_id UUID REFERENCES electricity_meters(id),
    reading_date DATE NOT NULL,
    previous_reading DECIMAL(10,2),
    current_reading DECIMAL(10,2),
    units_consumed DECIMAL(10,2),
    peak_hours_consumption DECIMAL(10,2) DEFAULT 0,
    off_peak_consumption DECIMAL(10,2) DEFAULT 0,
    demand_charges DECIMAL(15,2) DEFAULT 0,
    energy_charges DECIMAL(15,2) DEFAULT 0,
    fuel_adjustment DECIMAL(15,2) DEFAULT 0,
    other_charges DECIMAL(15,2) DEFAULT 0,
    total_bill_amount DECIMAL(15,2),
    source_type ENUM('pgvcl', 'solar', 'generator'),
    bill_number VARCHAR(100),
    bill_date DATE,
    due_date DATE,
    payment_status ENUM('pending', 'paid', 'overdue'),
    payment_date DATE,
    late_fee DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, meter_id, reading_date)
);
```

#### Solar Power Management
```sql
CREATE TABLE solar_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    panel_code VARCHAR(50) NOT NULL,
    capacity_kw DECIMAL(10,2),
    installation_date DATE,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    warranty_years INTEGER,
    location VARCHAR(255),
    tilt_angle DECIMAL(5,2),
    orientation ENUM('south', 'north', 'east', 'west', 'southeast', 'southwest'),
    is_active BOOLEAN DEFAULT true,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, panel_code)
);

CREATE TABLE solar_generation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    panel_id UUID REFERENCES solar_panels(id),
    generation_date DATE NOT NULL,
    units_generated DECIMAL(10,2),
    peak_generation DECIMAL(10,2),
    efficiency_percentage DECIMAL(5,2),
    weather_condition ENUM('sunny', 'cloudy', 'rainy', 'foggy'),
    temperature DECIMAL(4,1),
    irradiance DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, panel_id, generation_date)
);
```

### 9. Advanced Hospitality Management

#### Customer Visit Tracking
```sql
CREATE TABLE customer_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    visit_number VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    visit_date DATE NOT NULL,
    visit_purpose ENUM('business_meeting', 'factory_visit', 'quality_check', 'order_discussion', 'complaint', 'other'),
    visitors_count INTEGER DEFAULT 1,
    host_employee_id UUID REFERENCES employees(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    meeting_location VARCHAR(255),
    agenda TEXT,
    discussion_points TEXT,
    action_items TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    visit_outcome ENUM('successful', 'pending', 'cancelled', 'rescheduled'),
    customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, visit_number)
);
```

#### Hospitality Expenses (Enhanced)
```sql
CREATE TABLE hospitality_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    expense_number VARCHAR(50) NOT NULL,
    customer_visit_id UUID REFERENCES customer_visits(id),
    customer_id UUID REFERENCES customers(id),
    expense_type ENUM('hotel', 'food', 'gifts', 'transport', 'entertainment', 'other'),
    expense_category ENUM('accommodation', 'meals', 'local_transport', 'air_travel', 'gifts', 'miscellaneous'),
    amount DECIMAL(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    vendor_name VARCHAR(255),
    bill_number VARCHAR(100),
    purpose TEXT,
    location VARCHAR(255),
    guests_count INTEGER DEFAULT 1,
    per_person_cost DECIMAL(15,2),
    payment_mode ENUM('cash', 'card', 'upi', 'cheque', 'bank_transfer'),
    reimbursement_status ENUM('pending', 'approved', 'rejected', 'paid'),
    approved_by UUID REFERENCES users(id),
    approved_date DATE,
    receipt_url VARCHAR(500),
    tax_amount DECIMAL(15,2) DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, expense_number)
);
```

### 10. Advanced Quality Control Management

#### Quality Parameters
```sql
CREATE TABLE quality_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    parameter_code VARCHAR(50) NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    parameter_type ENUM('numeric', 'text', 'boolean', 'range'),
    unit_of_measure VARCHAR(20),
    min_value DECIMAL(15,3),
    max_value DECIMAL(15,3),
    target_value DECIMAL(15,3),
    tolerance DECIMAL(15,3),
    is_critical BOOLEAN DEFAULT false,
    applicable_products JSONB,
    test_method TEXT,
    frequency ENUM('every_batch', 'daily', 'weekly', 'monthly', 'random'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, parameter_code)
);
```

#### Quality Control Records
```sql
CREATE TABLE quality_control_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    qc_number VARCHAR(50) NOT NULL,
    production_order_id UUID REFERENCES production_orders(id),
    product_id UUID REFERENCES products(id),
    batch_number VARCHAR(100),
    test_date DATE NOT NULL,
    test_time TIME,
    inspector_id UUID REFERENCES employees(id),
    test_stage ENUM('incoming', 'in_process', 'final', 'pre_dispatch'),
    sample_size INTEGER,
    test_results JSONB,
    overall_result ENUM('pass', 'fail', 'conditional_pass'),
    defects_found JSONB,
    corrective_actions TEXT,
    retest_required BOOLEAN DEFAULT false,
    retest_date DATE,
    approved_by UUID REFERENCES users(id),
    approved_date DATE,
    certificate_number VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, qc_number)
);
```

This comprehensive model structure provides complete company-wise tracking for all aspects of the Factory ERP system with advanced features for multi-company operations, detailed tracking, and comprehensive business process management.
