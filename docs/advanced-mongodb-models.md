# Advanced PostgreSQL Database Schema - Factory ERP System

## Database Design Strategy - Complete Company-wise Tracking

### Multi-Tenant Architecture
Every table has `company_id` for complete data isolation between:
- **Dhruval Exim Private Limited** (company_id: 1)
- **Jinal Industries (Amar)** (company_id: 2)
- **Vimal Process** (company_id: 3)

### Naming Convention
- Tables: `snake_case` with company-wise data
- Columns: `snake_case` with descriptive names
- Indexes: `idx_tablename_columns`
- Foreign Keys: `fk_tablename_referenced_table`

---

## 1. COMPANY MASTER TABLES

### 1.1 Companies Table
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_code VARCHAR(20) UNIQUE NOT NULL, -- DHRUVAL, JINAL, VIMAL
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,

    -- Registration Details
    gstin VARCHAR(15) UNIQUE NOT NULL,
    pan VARCHAR(10) NOT NULL,
    cin VARCHAR(21),
    udyog_aadhar VARCHAR(20),
    iec_code VARCHAR(10),
    factory_license VARCHAR(50),
    pollution_clearance VARCHAR(50),
    registration_date DATE,
    incorporation_date DATE,

    -- Primary Address
    head_office_address TEXT,
    head_office_city VARCHAR(100),
    head_office_state VARCHAR(100),
    head_office_pincode VARCHAR(10),
    head_office_country VARCHAR(50) DEFAULT 'India',

    -- Contact Information
    primary_phone VARCHAR(15),
    primary_email VARCHAR(255),
    website VARCHAR(255),

    -- Business Configuration
    currency VARCHAR(3) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    fiscal_year_start VARCHAR(5) DEFAULT '04-01',
    fiscal_year_end VARCHAR(5) DEFAULT '03-31',

    -- Status & Tracking
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    verified_by INTEGER,

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_code ON companies(company_code);
CREATE INDEX idx_companies_active ON companies(is_active);
```

### 1.2 Company Locations Table
```sql
CREATE TABLE company_locations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    location_code VARCHAR(20) NOT NULL, -- DHRUVAL_FAC_001, DHRUVAL_WH_001
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(20) NOT NULL, -- factory, warehouse, office

    -- Address Details
    street_address TEXT,
    area VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(50) DEFAULT 'India',

    -- Coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Capacity Details
    total_area_sqft INTEGER,
    storage_capacity_kg INTEGER,
    daily_production_capacity INTEGER,
    monthly_production_capacity INTEGER,

    -- Facilities
    facilities TEXT[], -- Array of facilities
    certifications TEXT[], -- Array of certifications

    -- Contact
    manager_name VARCHAR(255),
    manager_phone VARCHAR(15),
    manager_email VARCHAR(255),

    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_locations_company ON company_locations(company_id);
CREATE INDEX idx_company_locations_type ON company_locations(company_id, location_type);
CREATE UNIQUE INDEX idx_company_locations_code ON company_locations(company_id, location_code);
```

### 1.3 Company Bank Accounts Table
```sql
CREATE TABLE company_bank_accounts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),

    -- Bank Details
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(20) NOT NULL, -- Current, Savings, CC, OD
    ifsc_code VARCHAR(11) NOT NULL,
    swift_code VARCHAR(11),
    account_holder_name VARCHAR(255) NOT NULL,

    -- Balance & Limits
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    overdraft_limit DECIMAL(15,2) DEFAULT 0.00,

    -- Transaction Limits
    daily_transaction_limit DECIMAL(15,2),
    monthly_transaction_limit DECIMAL(15,2),
    rtgs_limit DECIMAL(15,2),
    neft_limit DECIMAL(15,2),
    upi_limit DECIMAL(15,2),

    -- Relationship Manager
    rm_name VARCHAR(255),
    rm_phone VARCHAR(15),
    rm_email VARCHAR(255),

    -- Status
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_company ON company_bank_accounts(company_id);
CREATE INDEX idx_bank_accounts_primary ON company_bank_accounts(company_id, is_primary);
```

---

## 2. USER MANAGEMENT TABLES

### 2.1 Users Table - Complete User Management
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    display_name VARCHAR(255),

    -- Contact Details
    phone VARCHAR(15) NOT NULL,
    alternate_phone VARCHAR(15),
    whatsapp_number VARCHAR(15),

    -- Personal Details
    date_of_birth DATE,
    gender VARCHAR(10), -- Male, Female, Other
    blood_group VARCHAR(5),
    marital_status VARCHAR(20),

    -- Identity Documents
    aadhar_number VARCHAR(12),
    pan_number VARCHAR(10),
    driving_license VARCHAR(20),
    passport_number VARCHAR(20),

    -- Address
    current_address TEXT,
    current_city VARCHAR(100),
    current_state VARCHAR(100),
    current_pincode VARCHAR(10),

    permanent_address TEXT,
    permanent_city VARCHAR(100),
    permanent_state VARCHAR(100),
    permanent_pincode VARCHAR(10),

    -- Profile
    profile_photo_url TEXT,
    signature_url TEXT,

    -- Security Settings
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    password_last_changed TIMESTAMP,
    must_change_password BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE,
    lockout_time TIMESTAMP,
    last_login TIMESTAMP,
    last_login_ip INET,

    -- Preferences
    language VARCHAR(5) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',

    -- Notifications
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    whatsapp_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,

    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);
```

### 2.2 User Company Access Table - Multi-Company Support
```sql
CREATE TABLE user_company_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),

    -- Role & Department
    role VARCHAR(50) NOT NULL, -- super_admin, owner, manager, accountant, production_manager, sales_executive, security_guard, operator, helper
    department VARCHAR(50), -- Management, Production, Sales, Accounts, Security, Quality, Warehouse
    designation VARCHAR(100),
    employee_id VARCHAR(50),

    -- Employment Details
    joining_date DATE,
    leaving_date DATE,
    employment_type VARCHAR(20), -- Permanent, Contract, Temporary, Consultant
    reporting_manager_id INTEGER REFERENCES users(id),

    -- Salary Details
    basic_salary DECIMAL(10,2),
    hra DECIMAL(10,2),
    conveyance_allowance DECIMAL(10,2),
    other_allowances DECIMAL(10,2),
    gross_salary DECIMAL(10,2),

    -- Deductions
    pf_deduction DECIMAL(10,2),
    esi_deduction DECIMAL(10,2),
    professional_tax DECIMAL(10,2),
    tds_deduction DECIMAL(10,2),
    other_deductions DECIMAL(10,2),
    net_salary DECIMAL(10,2),

    -- Bank Details for Salary
    salary_bank_name VARCHAR(255),
    salary_account_number VARCHAR(50),
    salary_ifsc_code VARCHAR(11),

    -- Work Schedule
    shift_type VARCHAR(20), -- day, night, rotational
    working_hours_start TIME,
    working_hours_end TIME,
    break_duration_minutes INTEGER DEFAULT 60,

    -- Leave Entitlements
    casual_leave_balance INTEGER DEFAULT 12,
    sick_leave_balance INTEGER DEFAULT 12,
    earned_leave_balance INTEGER DEFAULT 21,

    -- Performance
    last_appraisal_date DATE,
    next_appraisal_date DATE,
    current_rating DECIMAL(3,2), -- Out of 5.00

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    termination_reason TEXT,

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_company_access_user ON user_company_access(user_id);
CREATE INDEX idx_user_company_access_company ON user_company_access(company_id);
CREATE INDEX idx_user_company_access_role ON user_company_access(company_id, role);
CREATE UNIQUE INDEX idx_user_company_unique ON user_company_access(user_id, company_id) WHERE is_active = TRUE;
```

### 2.3 User Permissions Table - Granular Access Control
```sql
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_company_access_id INTEGER NOT NULL REFERENCES user_company_access(id),

    -- Module Permissions
    module VARCHAR(50) NOT NULL, -- inventory, production, orders, financial, security, hr, admin

    -- Action Permissions
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE,
    can_export BOOLEAN DEFAULT FALSE,
    can_import BOOLEAN DEFAULT FALSE,

    -- Special Permissions
    can_view_reports BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_change_settings BOOLEAN DEFAULT FALSE,

    -- Financial Permissions
    transaction_limit DECIMAL(15,2),
    approval_limit DECIMAL(15,2),

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_permissions_access ON user_permissions(user_company_access_id);
CREATE INDEX idx_user_permissions_module ON user_permissions(user_company_access_id, module);
CREATE UNIQUE INDEX idx_user_permissions_unique ON user_permissions(user_company_access_id, module);
```

---

## 3. ATTENDANCE & SHIFT MANAGEMENT TABLES

### 3.1 Shifts Table
```sql
CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    shift_code VARCHAR(20) NOT NULL,
    shift_name VARCHAR(100) NOT NULL,

    -- Timing
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    break_duration_minutes INTEGER DEFAULT 60,

    -- Rates & Allowances
    overtime_rate DECIMAL(5,2) DEFAULT 1.5,
    night_allowance DECIMAL(8,2) DEFAULT 0.00,
    weekend_rate DECIMAL(5,2) DEFAULT 2.0,
    holiday_rate DECIMAL(5,2) DEFAULT 2.5,

    -- Working Days
    working_days TEXT[], -- Array: ['Monday', 'Tuesday', ...]

    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shifts_company ON shifts(company_id);
CREATE UNIQUE INDEX idx_shifts_code ON shifts(company_id, shift_code);
```

### 3.2 Employee Attendance Table
```sql
CREATE TABLE employee_attendance (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    attendance_date DATE NOT NULL,

    -- Shift Details
    shift_id INTEGER REFERENCES shifts(id),
    planned_start_time TIME,
    planned_end_time TIME,

    -- Actual Timing
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    actual_hours_worked DECIMAL(4,2),
    break_time_minutes INTEGER DEFAULT 0,

    -- Attendance Status
    attendance_status VARCHAR(20) NOT NULL, -- Present, Absent, Half_Day, Late, Early_Leave, Holiday, Leave
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,

    -- Overtime
    overtime_hours DECIMAL(4,2) DEFAULT 0.00,
    overtime_approved BOOLEAN DEFAULT FALSE,
    overtime_approved_by INTEGER REFERENCES users(id),
    overtime_rate DECIMAL(5,2),
    overtime_amount DECIMAL(8,2) DEFAULT 0.00,

    -- Leave Details
    leave_type VARCHAR(20), -- Casual, Sick, Earned, Maternity, Paternity
    leave_reason TEXT,
    leave_approved_by INTEGER REFERENCES users(id),

    -- Check-in/out Method
    checkin_method VARCHAR(20), -- Biometric, Manual, Mobile_App, Web
    checkout_method VARCHAR(20),
    checkin_location VARCHAR(100),
    checkout_location VARCHAR(100),

    -- Production Work (for production workers)
    production_orders TEXT[], -- Array of production order IDs worked on
    total_production DECIMAL(10,2),
    production_unit VARCHAR(20),
    quality_rating DECIMAL(3,2), -- Daily quality rating

    -- Approval
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_notes TEXT,

    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_company_date ON employee_attendance(company_id, attendance_date);
CREATE INDEX idx_attendance_user_date ON employee_attendance(user_id, attendance_date);
CREATE INDEX idx_attendance_status ON employee_attendance(company_id, attendance_status, attendance_date);
CREATE UNIQUE INDEX idx_attendance_unique ON employee_attendance(company_id, user_id, attendance_date);
```

---

## 4. SECURITY & VISITOR MANAGEMENT TABLES

### 4.1 Security Staff Table
```sql
CREATE TABLE security_staff (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    guard_id VARCHAR(50) NOT NULL, -- DHRUVAL_GUARD_001

    -- Personal Details
    guard_name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),

    -- Identity Verification
    police_verification_number VARCHAR(50),
    police_verification_date DATE,
    police_verification_valid_till DATE,
    is_police_verified BOOLEAN DEFAULT FALSE,

    -- Training & Certifications
    security_training_completed BOOLEAN DEFAULT FALSE,
    training_completion_date DATE,
    certifications TEXT[], -- Array of security certifications

    -- Duty Assignment
    assigned_gate VARCHAR(100),
    shift_preference VARCHAR(20), -- day, night, rotational

    -- Emergency Contacts
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(15),
    emergency_contact_relation VARCHAR(50),

    -- Performance Metrics
    incident_reports_count INTEGER DEFAULT 0,
    customer_complaints_count INTEGER DEFAULT 0,
    performance_rating DECIMAL(3,2) DEFAULT 0.00,

    -- Responsibilities
    responsibilities TEXT[], -- Array of assigned responsibilities

    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_staff_company ON security_staff(company_id);
CREATE INDEX idx_security_staff_user ON security_staff(user_id);
CREATE UNIQUE INDEX idx_security_staff_guard_id ON security_staff(company_id, guard_id);
```

### 4.2 Vehicle Entry/Exit Logs Table
```sql
CREATE TABLE vehicle_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    log_number VARCHAR(50) NOT NULL, -- DHRUVAL_VL_2024_001

    -- Vehicle Details
    vehicle_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL, -- Truck, Car, Bike, Tempo, Container, Trailer

    -- Driver Details
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(15) NOT NULL,
    driver_license_number VARCHAR(50),
    driver_license_expiry DATE,
    driver_photo_url TEXT,

    -- Transport Details
    transporter_name VARCHAR(255),
    transporter_contact VARCHAR(15),

    -- Visit Purpose
    visit_purpose VARCHAR(50) NOT NULL, -- material_delivery, material_pickup, maintenance, official_visit, customer_visit
    visit_description TEXT,

    -- Entry Details
    entry_time TIMESTAMP NOT NULL,
    entry_gate VARCHAR(100),
    entry_security_staff_id INTEGER REFERENCES security_staff(id),

    -- Exit Details
    exit_time TIMESTAMP,
    exit_gate VARCHAR(100),
    exit_security_staff_id INTEGER REFERENCES security_staff(id),

    -- Duration
    visit_duration_minutes INTEGER,
    is_overstay BOOLEAN DEFAULT FALSE,
    overstay_reason TEXT,

    -- Document Verification
    documents_verified TEXT[], -- Array: ['Driving License', 'Vehicle RC', 'Delivery Challan']
    missing_documents TEXT[],
    document_photos TEXT[], -- Array of document photo URLs

    -- Material Details (if applicable)
    is_carrying_material BOOLEAN DEFAULT FALSE,
    material_type VARCHAR(50), -- Raw_Material, Finished_Goods, Empty, Others
    gate_pass_number VARCHAR(50),
    related_document_type VARCHAR(50), -- Purchase_Order, Dispatch_Note, Transfer_Note
    related_document_number VARCHAR(50),

    -- Physical Verification
    physical_verification_done BOOLEAN DEFAULT FALSE,
    weight_verification_done BOOLEAN DEFAULT FALSE,
    declared_weight DECIMAL(10,2),
    actual_weight DECIMAL(10,2),
    weight_variance DECIMAL(10,2),

    -- Status & Approval
    status VARCHAR(20) DEFAULT 'In_Progress', -- In_Progress, Completed, Overstay, Emergency_Exit
    approved_by INTEGER REFERENCES users(id),
    approval_time TIMESTAMP,
    approval_remarks TEXT,

    -- Additional Information
    weather_conditions VARCHAR(50),
    special_instructions TEXT,
    security_remarks TEXT,
    incident_reported BOOLEAN DEFAULT FALSE,
    incident_details TEXT,

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_logs_company_date ON vehicle_logs(company_id, DATE(entry_time));
CREATE INDEX idx_vehicle_logs_vehicle ON vehicle_logs(vehicle_number, entry_time);
CREATE INDEX idx_vehicle_logs_status ON vehicle_logs(company_id, status);
CREATE INDEX idx_vehicle_logs_purpose ON vehicle_logs(company_id, visit_purpose, DATE(entry_time));
```

### 4.3 Visitor Management Table
```sql
CREATE TABLE visitor_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    visitor_log_number VARCHAR(50) NOT NULL, -- DHRUVAL_VIS_2024_001

    -- Visitor Personal Details
    visitor_name VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(15) NOT NULL,
    visitor_email VARCHAR(255),
    visitor_company VARCHAR(255),
    visitor_designation VARCHAR(100),

    -- Identity Verification
    id_proof_type VARCHAR(20) NOT NULL, -- Aadhar, PAN, Driving_License, Passport, Voter_ID
    id_proof_number VARCHAR(50) NOT NULL,
    id_proof_photo_url TEXT,
    visitor_photo_url TEXT,

    -- Visit Details
    visit_purpose VARCHAR(100) NOT NULL, -- Business_Meeting, Delivery, Maintenance, Interview, Audit, Others
    visit_description TEXT,

    -- Person to Meet
    person_to_meet_id INTEGER REFERENCES users(id),
    person_to_meet_name VARCHAR(255),
    person_to_meet_department VARCHAR(100),
    person_to_meet_phone VARCHAR(15),

    -- Appointment Details
    is_appointment_scheduled BOOLEAN DEFAULT FALSE,
    appointment_time TIMESTAMP,
    expected_duration_minutes INTEGER,

    -- Entry Details
    entry_time TIMESTAMP NOT NULL,
    entry_gate VARCHAR(100),
    entry_security_staff_id INTEGER REFERENCES security_staff(id),

    -- Badge & Escort
    badge_number VARCHAR(20),
    badge_issued BOOLEAN DEFAULT FALSE,
    escort_required BOOLEAN DEFAULT FALSE,
    escorted_by_id INTEGER REFERENCES users(id),
    escort_name VARCHAR(255),

    -- Exit Details
    exit_time TIMESTAMP,
    exit_gate VARCHAR(100),
    exit_security_staff_id INTEGER REFERENCES security_staff(id),
    badge_returned BOOLEAN DEFAULT FALSE,

    -- Visit Summary
    actual_duration_minutes INTEGER,
    meeting_outcome TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    next_visit_scheduled DATE,

    -- Visitor Feedback
    visitor_rating INTEGER, -- 1 to 5
    visitor_feedback TEXT,

    -- Security Assessment
    security_risk_level VARCHAR(20) DEFAULT 'Low', -- Low, Medium, High
    security_remarks TEXT,
    background_check_required BOOLEAN DEFAULT FALSE,
    background_check_completed BOOLEAN DEFAULT FALSE,

    -- Status
    status VARCHAR(20) DEFAULT 'Scheduled', -- Scheduled, In_Progress, Completed, Cancelled, Overstay, Emergency_Exit

    -- Additional Information
    items_carried TEXT[], -- Array of items visitor is carrying
    restricted_areas TEXT[], -- Areas visitor is not allowed
    special_instructions TEXT,

    -- Emergency Information
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(15),

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visitor_logs_company_date ON visitor_logs(company_id, DATE(entry_time));
CREATE INDEX idx_visitor_logs_visitor ON visitor_logs(visitor_phone, entry_time);
CREATE INDEX idx_visitor_logs_person_to_meet ON visitor_logs(person_to_meet_id, DATE(entry_time));
CREATE INDEX idx_visitor_logs_status ON visitor_logs(company_id, status);
```

### 4.4 Material Gate Pass Table
```sql
CREATE TABLE material_gate_passes (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    gate_pass_number VARCHAR(50) NOT NULL, -- DHRUVAL_GP_2024_001

    -- Gate Pass Type
    gate_pass_type VARCHAR(20) NOT NULL, -- Inward, Outward, Transfer, Return
    movement_date DATE NOT NULL,

    -- Related Document
    related_document_type VARCHAR(50), -- Purchase_Order, Sales_Order, Dispatch_Note, Transfer_Note, Return_Note
    related_document_id INTEGER,
    related_document_number VARCHAR(50),

    -- Material Details
    total_items INTEGER DEFAULT 0,
    total_quantity DECIMAL(15,3) DEFAULT 0.000,
    total_weight DECIMAL(10,2) DEFAULT 0.00,
    total_value DECIMAL(15,2) DEFAULT 0.00,

    -- Transport Details
    vehicle_number VARCHAR(20),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(15),
    driver_license VARCHAR(50),
    transporter_name VARCHAR(255),

    -- Courier Details (if applicable)
    courier_company VARCHAR(100),
    awb_number VARCHAR(50),
    tracking_number VARCHAR(50),

    -- Source/Destination
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    from_warehouse_id INTEGER,
    to_warehouse_id INTEGER,

    -- Approval Workflow
    requested_by INTEGER NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_remarks TEXT,

    -- Security Verification
    security_verified_by INTEGER REFERENCES security_staff(id),
    security_verified_at TIMESTAMP,
    documents_checked TEXT[], -- Array of verified documents
    physical_verification_done BOOLEAN DEFAULT FALSE,
    weight_verification_done BOOLEAN DEFAULT FALSE,
    verification_remarks TEXT,

    -- Quality Check (if required)
    quality_check_required BOOLEAN DEFAULT FALSE,
    quality_checked_by INTEGER REFERENCES users(id),
    quality_checked_at TIMESTAMP,
    quality_status VARCHAR(20), -- Approved, Rejected, Conditional
    quality_remarks TEXT,

    -- Status & Timing
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, In_Transit, Completed, Cancelled, Rejected
    valid_from TIMESTAMP,
    valid_till TIMESTAMP,

    -- Actual Movement
    actual_dispatch_time TIMESTAMP,
    actual_receipt_time TIMESTAMP,
    movement_completed_by INTEGER REFERENCES users(id),

    -- Discrepancies
    has_discrepancy BOOLEAN DEFAULT FALSE,
    discrepancy_details TEXT,
    discrepancy_resolved BOOLEAN DEFAULT FALSE,
    resolution_remarks TEXT,

    -- Additional Information
    special_handling_instructions TEXT,
    packaging_details TEXT,
    insurance_required BOOLEAN DEFAULT FALSE,
    insurance_value DECIMAL(15,2),

    notes TEXT,
    attachments TEXT[], -- Array of document URLs

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gate_passes_company_date ON material_gate_passes(company_id, movement_date);
CREATE INDEX idx_gate_passes_type ON material_gate_passes(company_id, gate_pass_type);
CREATE INDEX idx_gate_passes_status ON material_gate_passes(company_id, status);
CREATE INDEX idx_gate_passes_document ON material_gate_passes(related_document_type, related_document_number);
CREATE UNIQUE INDEX idx_gate_passes_number ON material_gate_passes(company_id, gate_pass_number);
```

### 4.5 Material Gate Pass Items Table
```sql
CREATE TABLE material_gate_pass_items (
    id SERIAL PRIMARY KEY,
    gate_pass_id INTEGER NOT NULL REFERENCES material_gate_passes(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),

    -- Item Details
    item_code VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,

    -- Quantity Details
    quantity DECIMAL(15,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    rate DECIMAL(12,2),
    total_value DECIMAL(15,2),

    -- Physical Details
    weight DECIMAL(10,2),
    dimensions VARCHAR(100), -- L x W x H
    packaging_type VARCHAR(50),

    -- Batch/Serial Tracking
    batch_number VARCHAR(50),
    serial_numbers TEXT[], -- Array of serial numbers
    manufacturing_date DATE,
    expiry_date DATE,

    -- Quality Details
    quality_grade VARCHAR(10),
    quality_parameters JSONB, -- JSON object for quality parameters

    -- Verification Status
    physical_verified BOOLEAN DEFAULT FALSE,
    quantity_verified BOOLEAN DEFAULT FALSE,
    quality_verified BOOLEAN DEFAULT FALSE,

    -- Discrepancies
    declared_quantity DECIMAL(15,3),
    actual_quantity DECIMAL(15,3),
    quantity_variance DECIMAL(15,3) DEFAULT 0.000,

    -- Condition Assessment
    item_condition VARCHAR(20) DEFAULT 'Good', -- Good, Damaged, Defective, Expired
    damage_details TEXT,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gate_pass_items_gate_pass ON material_gate_pass_items(gate_pass_id);
CREATE INDEX idx_gate_pass_items_company ON material_gate_pass_items(company_id);
CREATE INDEX idx_gate_pass_items_batch ON material_gate_pass_items(batch_number);
```

---

## 5. INVENTORY MANAGEMENT TABLES

### 5.1 Product Categories Table
```sql
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    category_code VARCHAR(50) NOT NULL, -- DHRUVAL_RAW_FABRIC
    category_name VARCHAR(255) NOT NULL,

    -- Category Classification
    category_type VARCHAR(20) NOT NULL, -- raw_material, semi_finished, finished_goods, consumables
    parent_category_id INTEGER REFERENCES product_categories(id),
    category_level INTEGER DEFAULT 1, -- 1=Primary, 2=Secondary, 3=Tertiary

    -- Category Specifications
    description TEXT,
    specifications JSONB, -- JSON object for category-specific specifications

    -- HSN/SAC Code for GST
    hsn_code VARCHAR(10),
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    cess_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Default Settings
    default_unit VARCHAR(20),
    default_reorder_level INTEGER DEFAULT 0,
    default_max_stock_level INTEGER DEFAULT 0,

    -- Quality Parameters
    quality_parameters TEXT[], -- Array of quality parameters to check

    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_categories_company ON product_categories(company_id);
CREATE INDEX idx_product_categories_type ON product_categories(company_id, category_type);
CREATE UNIQUE INDEX idx_product_categories_code ON product_categories(company_id, category_code);
```

### 5.2 Inventory Items Table - Complete Item Master
```sql
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),

    -- Item Identification - Company-wise Unique
    item_code VARCHAR(100) NOT NULL, -- Company-wise unique: DHRUVAL_GF_001
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,

    -- Alternative Codes
    barcode VARCHAR(50),
    qr_code VARCHAR(100),
    supplier_item_code VARCHAR(100),
    customer_item_code VARCHAR(100),

    -- Categorization
    category_id INTEGER NOT NULL REFERENCES product_categories(id),
    item_type VARCHAR(20) NOT NULL, -- raw_material, semi_finished, finished_goods, consumables
    product_type VARCHAR(50), -- saree, african_cotton, garment_fabric, digital_print, custom, chemical, dye

    -- Technical Specifications
    specifications JSONB, -- JSON object for all specifications

    -- Fabric Specific (if applicable)
    gsm INTEGER,
    width_inches DECIMAL(6,2),
    length_meters DECIMAL(10,2),
    weight_grams DECIMAL(10,2),
    color VARCHAR(100),
    design VARCHAR(255),
    pattern VARCHAR(100),
    fabric_composition VARCHAR(255),

    -- Chemical Specific (if applicable)
    concentration_percentage DECIMAL(5,2),
    purity_percentage DECIMAL(5,2),
    ph_level DECIMAL(4,2),
    chemical_formula VARCHAR(100),

    -- Stock Management
    current_stock DECIMAL(15,3) DEFAULT 0.000,
    reserved_stock DECIMAL(15,3) DEFAULT 0.000,
    available_stock DECIMAL(15,3) DEFAULT 0.000,
    in_transit_stock DECIMAL(15,3) DEFAULT 0.000,
    damaged_stock DECIMAL(15,3) DEFAULT 0.000,

    -- Units
    primary_unit VARCHAR(20) NOT NULL, -- meters, kg, pieces, liters
    secondary_unit VARCHAR(20),
    conversion_factor DECIMAL(10,4) DEFAULT 1.0000,

    -- Stock Levels
    reorder_level DECIMAL(15,3) DEFAULT 0.000,
    min_stock_level DECIMAL(15,3) DEFAULT 0.000,
    max_stock_level DECIMAL(15,3) DEFAULT 0.000,
    economic_order_quantity DECIMAL(15,3) DEFAULT 0.000,

    -- Valuation
    valuation_method VARCHAR(20) DEFAULT 'FIFO', -- FIFO, LIFO, Weighted_Average
    average_cost DECIMAL(12,4) DEFAULT 0.0000,
    last_purchase_cost DECIMAL(12,4) DEFAULT 0.0000,
    standard_cost DECIMAL(12,4) DEFAULT 0.0000,
    total_stock_value DECIMAL(15,2) DEFAULT 0.00,

    -- Pricing
    cost_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    mrp DECIMAL(12,2),
    margin_percentage DECIMAL(5,2),

    -- Quality Parameters
    quality_grade VARCHAR(10) DEFAULT 'A', -- A+, A, B+, B, C
    quality_parameters JSONB, -- JSON object for quality specifications
    quality_check_required BOOLEAN DEFAULT TRUE,
    shelf_life_days INTEGER,

    -- Manufacturing Details (for finished goods)
    manufacturing_cost DECIMAL(12,2),
    labor_cost DECIMAL(12,2),
    overhead_cost DECIMAL(12,2),
    manufacturing_time_minutes INTEGER,
    batch_size DECIMAL(15,3),

    -- Supplier Information
    primary_supplier_id INTEGER,
    primary_supplier_name VARCHAR(255),
    supplier_lead_time_days INTEGER DEFAULT 0,
    min_order_quantity DECIMAL(15,3) DEFAULT 0.000,

    -- Location Tracking
    default_warehouse_id INTEGER,
    default_location VARCHAR(100),

    -- Status & Flags
    is_active BOOLEAN DEFAULT TRUE,
    is_discontinued BOOLEAN DEFAULT FALSE,
    is_fast_moving BOOLEAN DEFAULT FALSE,
    is_slow_moving BOOLEAN DEFAULT FALSE,
    is_obsolete BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    is_serialized BOOLEAN DEFAULT FALSE,
    is_batch_tracked BOOLEAN DEFAULT FALSE,

    -- Tracking & Audit
    last_stock_update TIMESTAMP,
    last_movement_date TIMESTAMP,
    total_inward DECIMAL(15,3) DEFAULT 0.000,
    total_outward DECIMAL(15,3) DEFAULT 0.000,
    total_adjustments DECIMAL(15,3) DEFAULT 0.000,

    -- Additional Information
    notes TEXT,
    tags TEXT[], -- Array of tags
    images TEXT[], -- Array of image URLs
    documents TEXT[], -- Array of document URLs

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_items_company ON inventory_items(company_id);
CREATE INDEX idx_inventory_items_code ON inventory_items(company_id, item_code);
CREATE INDEX idx_inventory_items_category ON inventory_items(company_id, category_id);
CREATE INDEX idx_inventory_items_type ON inventory_items(company_id, item_type);
CREATE INDEX idx_inventory_items_stock ON inventory_items(company_id, current_stock);
CREATE INDEX idx_inventory_items_active ON inventory_items(company_id, is_active);
CREATE UNIQUE INDEX idx_inventory_items_company_code ON inventory_items(company_id, item_code);

-- Full text search index
CREATE INDEX idx_inventory_items_search ON inventory_items USING gin(to_tsvector('english', item_name || ' ' || COALESCE(item_description, '') || ' ' || item_code));
```

### 5.3 Stock Movements Table - Complete Transaction Tracking
```sql
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),

    -- Movement Identification
    movement_number VARCHAR(50) NOT NULL, -- DHRUVAL_SM_2024_001
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Item Details
    item_id INTEGER NOT NULL REFERENCES inventory_items(id),
    item_code VARCHAR(100),
    item_name VARCHAR(255),

    -- Movement Classification
    movement_type VARCHAR(30) NOT NULL, -- inward, outward, transfer, adjustment, production_consume, production_output, return, damage, theft
    transaction_type VARCHAR(30), -- purchase, sale, production, transfer, adjustment, return, write_off

    -- Reference Document
    reference_document_type VARCHAR(50), -- purchase_order, sales_order, production_order, transfer_note, adjustment_note
    reference_document_id INTEGER,
    reference_document_number VARCHAR(50),

    -- Quantity & Valuation
    quantity DECIMAL(15,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    rate DECIMAL(12,4),
    total_value DECIMAL(15,2),

    -- Location Details
    from_warehouse_id INTEGER,
    from_warehouse_name VARCHAR(255),
    from_location VARCHAR(100),
    from_zone VARCHAR(50),
    from_rack VARCHAR(50),
    from_bin VARCHAR(50),

    to_warehouse_id INTEGER,
    to_warehouse_name VARCHAR(255),
    to_location VARCHAR(100),
    to_zone VARCHAR(50),
    to_rack VARCHAR(50),
    to_bin VARCHAR(50),

    -- External Location (for inward/outward)
    external_location VARCHAR(255), -- Supplier/Customer location

    -- Batch & Serial Tracking
    batch_number VARCHAR(50),
    lot_number VARCHAR(50),
    serial_numbers TEXT[], -- Array of serial numbers
    manufacturing_date DATE,
    expiry_date DATE,
    supplier_batch_number VARCHAR(50),

    -- Quality Control
    quality_check_required BOOLEAN DEFAULT FALSE,
    quality_check_completed BOOLEAN DEFAULT FALSE,
    quality_checked_by INTEGER REFERENCES users(id),
    quality_checked_at TIMESTAMP,
    quality_grade VARCHAR(10),
    quality_status VARCHAR(20), -- Approved, Rejected, Conditional
    defects_found TEXT[],
    rejected_quantity DECIMAL(15,3) DEFAULT 0.000,
    accepted_quantity DECIMAL(15,3),
    quality_notes TEXT,
    quality_images TEXT[],

    -- Gate Pass & Security
    gate_pass_id INTEGER REFERENCES material_gate_passes(id),
    gate_pass_number VARCHAR(50),
    vehicle_number VARCHAR(20),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(15),
    transporter_name VARCHAR(255),

    security_verified_by INTEGER REFERENCES security_staff(id),
    security_verified_at TIMESTAMP,
    security_remarks TEXT,
    documents_verified TEXT[],

    -- Stock Impact
    stock_before DECIMAL(15,3),
    stock_after DECIMAL(15,3),
    reserved_before DECIMAL(15,3),
    reserved_after DECIMAL(15,3),
    available_before DECIMAL(15,3),
    available_after DECIMAL(15,3),

    -- Cost Impact
    cost_before DECIMAL(12,4),
    cost_after DECIMAL(12,4),
    total_value_before DECIMAL(15,2),
    total_value_after DECIMAL(15,2),
    cost_method VARCHAR(20), -- FIFO, LIFO, Weighted_Average

    -- Approval Workflow
    approval_required BOOLEAN DEFAULT FALSE,
    requested_by INTEGER REFERENCES users(id),
    requested_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_level INTEGER DEFAULT 1,
    approval_status VARCHAR(20) DEFAULT 'approved', -- pending, approved, rejected
    approval_notes TEXT,

    -- Additional Information
    reason VARCHAR(255),
    notes TEXT,
    internal_notes TEXT, -- For internal use only
    tags TEXT[],
    attachments TEXT[], -- Array of supporting document URLs

    -- System Tracking
    is_system_generated BOOLEAN DEFAULT FALSE,
    parent_movement_id INTEGER REFERENCES stock_movements(id), -- For linked movements

    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_company_date ON stock_movements(company_id, DATE(movement_date));
CREATE INDEX idx_stock_movements_item ON stock_movements(company_id, item_id, movement_date DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(company_id, movement_type, movement_date DESC);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_document_type, reference_document_number);
CREATE INDEX idx_stock_movements_batch ON stock_movements(batch_number, movement_date DESC);
CREATE INDEX idx_stock_movements_approval ON stock_movements(company_id, approval_status, approval_required);
```
```
```
