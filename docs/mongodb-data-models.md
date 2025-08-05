# MongoDB Data Models - Factory ERP System

## Database Design Strategy

### Company-wise Data Segregation
All collections will have `companyId` field for complete data isolation:
- **Dhruval Exim Private Limited** - companyId: "DHRUVAL_001"
- **Jinal Industries (Amar)** - companyId: "JINAL_001" 
- **Vimal Process** - companyId: "VIMAL_001"

### Indexing Strategy
```javascript
// Primary indexes for all collections
{ companyId: 1, createdAt: -1 }
{ companyId: 1, status: 1, updatedAt: -1 }
{ companyId: 1, _id: 1 }
```

## 1. Company Management Models

### 1.1 Company Master Collection
```javascript
// Collection: companies
{
  _id: ObjectId,
  companyCode: "DHRUVAL", // Unique identifier
  companyName: "Dhruval Exim Private Limited",
  legalName: "Dhruval Exim Private Limited",
  gstin: "24XXXXX1234X1ZX",
  pan: "XXXXX1234X",
  address: {
    street: "Plot No. 123, Industrial Area",
    city: "Surat",
    state: "Gujarat",
    pincode: "395006",
    country: "India"
  },
  contact: {
    phone: ["+91-9876543210", "+91-0261-1234567"],
    email: ["info@dhruvalexim.com", "accounts@dhruvalexim.com"],
    website: "www.dhruvalexim.com"
  },
  bankDetails: [{
    bankName: "HDFC Bank",
    accountNumber: "12345678901234",
    ifscCode: "HDFC0001234",
    accountType: "Current",
    currentBalance: 2500000.00
  }],
  settings: {
    currency: "INR",
    timezone: "Asia/Kolkata",
    fiscalYearStart: "04-01",
    gstRate: 18,
    workingHours: {
      start: "09:00",
      end: "18:00",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
  },
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 1.2 User Management Collection
```javascript
// Collection: users
{
  _id: ObjectId,
  username: "admin_dhruval",
  email: "admin@dhruvalexim.com",
  password: "$2b$10$hashedpassword", // bcrypt hashed
  profile: {
    firstName: "Rajesh",
    lastName: "Patel",
    phone: "+91-9876543210",
    avatar: "https://s3.amazonaws.com/avatars/user123.jpg",
    employeeId: "EMP001",
    designation: "Factory Manager"
  },
  companyAccess: [{
    companyId: ObjectId("DHRUVAL_COMPANY_ID"),
    role: "owner", // owner, manager, accountant, staff, security
    permissions: [{
      module: "inventory", // inventory, production, orders, financial, security
      actions: ["create", "read", "update", "delete", "approve"]
    }, {
      module: "production",
      actions: ["create", "read", "update", "approve"]
    }],
    isActive: true,
    joinedAt: ISODate
  }],
  lastLogin: ISODate,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 2. Inventory Management Models

### 2.1 Product Categories Collection
```javascript
// Collection: product_categories
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  categoryCode: "RAW_GREY_FABRIC",
  categoryName: "Grey Fabric - Raw Material",
  categoryType: "raw_material", // raw_material, semi_finished, finished_goods
  description: "Unprocessed grey fabric for printing",
  specifications: [{
    attribute: "GSM",
    dataType: "number",
    isRequired: true,
    defaultValue: "120"
  }, {
    attribute: "Width",
    dataType: "number",
    isRequired: true,
    defaultValue: "44"
  }, {
    attribute: "Quality",
    dataType: "text",
    isRequired: true,
    defaultValue: "A Grade"
  }],
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.2 Inventory Master Collection
```javascript
// Collection: inventory
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  itemCode: "GF-120-44-WHITE-001",
  itemName: "Grey Fabric 120 GSM White",
  categoryId: ObjectId("CATEGORY_ID"),
  itemType: "raw_material",
  specifications: {
    gsm: 120,
    color: "White",
    design: "Plain",
    width: 44,
    length: null,
    weight: null,
    customAttributes: {
      fabricType: "Cotton",
      weaveType: "Plain",
      shrinkage: "2%"
    }
  },
  stockDetails: {
    currentStock: 5000.00,
    reservedStock: 500.00,
    availableStock: 4500.00,
    unit: "meters",
    reorderLevel: 1000.00,
    maxStockLevel: 10000.00
  },
  locationTracking: [{
    warehouseId: ObjectId("WAREHOUSE_ID"),
    location: "A-Block-Rack-01",
    quantity: 3000.00,
    lastUpdated: ISODate
  }, {
    warehouseId: ObjectId("WAREHOUSE_ID"),
    location: "B-Block-Rack-05",
    quantity: 2000.00,
    lastUpdated: ISODate
  }],
  pricing: {
    costPrice: 45.00,
    sellingPrice: 65.00,
    mrp: 75.00,
    currency: "INR"
  },
  supplier: {
    supplierId: ObjectId("SUPPLIER_ID"),
    supplierName: "Gujarat Textile Mills",
    lastPurchaseDate: ISODate,
    lastPurchaseRate: 44.50
  },
  qualityParams: {
    qualityGrade: "A",
    defectPercentage: 0.5,
    lastQualityCheck: ISODate,
    qualityNotes: "Good quality, minimal defects"
  },
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.3 Stock Movement Tracking Collection
```javascript
// Collection: stock_movements
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  itemId: ObjectId("INVENTORY_ITEM_ID"),
  movementType: "inward", // inward, outward, transfer, adjustment, production_consume, production_output
  referenceType: "purchase", // purchase, sale, production, transfer, adjustment, return
  referenceId: ObjectId("PURCHASE_ORDER_ID"),
  quantity: 1000.00,
  unit: "meters",
  rate: 45.00,
  totalValue: 45000.00,
  fromLocation: {
    warehouseId: null, // null for external
    location: "Supplier Godown"
  },
  toLocation: {
    warehouseId: ObjectId("WAREHOUSE_ID"),
    location: "A-Block-Rack-01"
  },
  batchDetails: {
    batchNumber: "BATCH_2024_001",
    lotNumber: "LOT_GTM_001",
    expiryDate: null,
    manufacturingDate: ISODate
  },
  qualityCheck: {
    isChecked: true,
    checkedBy: ObjectId("QC_USER_ID"),
    qualityGrade: "A",
    defects: [],
    notes: "Quality approved"
  },
  gatePass: {
    gatePassNumber: "GP_2024_001",
    vehicleNumber: "GJ-05-AB-1234",
    driverName: "Ramesh Kumar",
    driverPhone: "+91-9876543210",
    securityApproval: {
      approvedBy: ObjectId("SECURITY_USER_ID"),
      approvedAt: ISODate,
      remarks: "All documents verified"
    }
  },
  stockBefore: 4000.00,
  stockAfter: 5000.00,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 2.4 Warehouse Management Collection
```javascript
// Collection: warehouses
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  warehouseCode: "WH_DHRUVAL_001",
  warehouseName: "Main Raw Material Warehouse",
  warehouseType: "raw_material", // raw_material, semi_finished, finished_goods, mixed
  address: {
    street: "Plot No. 456, Industrial Area",
    city: "Surat",
    state: "Gujarat",
    pincode: "395006"
  },
  capacity: {
    totalArea: 10000, // sq ft
    usedArea: 6500,
    availableArea: 3500,
    unit: "sqft"
  },
  manager: {
    managerId: ObjectId("MANAGER_USER_ID"),
    managerName: "Suresh Patel",
    phone: "+91-9876543211"
  },
  securityFeatures: {
    hasCCTV: true,
    hasFireSafety: true,
    hasSecurityGuard: true,
    accessControl: "Biometric + Card Access"
  },
  zones: [{
    zoneName: "A-Block",
    zoneType: "Grey Fabric Storage",
    capacity: 3000,
    currentUtilization: 2100
  }, {
    zoneName: "B-Block", 
    zoneType: "Chemical Storage",
    capacity: 2000,
    currentUtilization: 1200
  }],
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 3. Production Management Models

### 3.1 Production Process Master Collection
```javascript
// Collection: production_processes
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  processCode: "PRINT_TABLE_001",
  processName: "Table Printing Process",
  processType: "printing", // printing, washing, fixing, stitching, finishing, quality_check
  printingMethod: "table_printing", // table_printing, machine_printing, digital_printing
  sequence: 1, // Order in production flow
  estimatedTime: 480, // in minutes (8 hours)
  requiredSkills: ["Table Printing", "Color Mixing", "Pattern Alignment"],
  qualityCheckpoints: [{
    checkpointName: "Color Consistency Check",
    parameters: ["Color Match", "Print Clarity", "Pattern Alignment"],
    acceptanceCriteria: "95% color match with approved sample"
  }, {
    checkpointName: "Print Quality Check",
    parameters: ["Sharpness", "Coverage", "Defects"],
    acceptanceCriteria: "Less than 2% defective area"
  }],
  resourceRequirements: {
    manpower: 2,
    machines: ["TABLE_PRINT_001"],
    materials: ["Printing Paste", "Thickener", "Binder"]
  },
  costParameters: {
    laborCostPerHour: 150.00,
    machineCostPerHour: 200.00,
    overheadCostPerHour: 50.00
  },
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 3.2 Production Order Collection
```javascript
// Collection: production_orders
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  productionOrderNumber: "PO_DHRUVAL_2024_001",
  customerOrderId: ObjectId("CUSTOMER_ORDER_ID"),
  productDetails: {
    productType: "saree", // saree, african_cotton, garment_fabric, digital_print, custom
    design: "Floral Print Design 001",
    color: "Red with Gold Border",
    gsm: 120,
    width: 44,
    quantity: 100.00,
    unit: "pieces"
  },
  rawMaterials: [{
    itemId: ObjectId("GREY_FABRIC_ID"),
    requiredQuantity: 600.00,
    allocatedQuantity: 600.00,
    consumedQuantity: 580.00,
    unit: "meters",
    rate: 45.00
  }, {
    itemId: ObjectId("PRINTING_PASTE_ID"),
    requiredQuantity: 50.00,
    allocatedQuantity: 50.00,
    consumedQuantity: 48.00,
    unit: "kg",
    rate: 250.00
  }],
  productionStages: [{
    processId: ObjectId("PRINT_PROCESS_ID"),
    stageNumber: 1,
    stageName: "Table Printing",
    status: "completed",
    assignedTo: {
      workerId: ObjectId("WORKER_USER_ID"),
      workerName: "Mahesh Kumar",
      machineId: ObjectId("TABLE_PRINT_MACHINE_ID"),
      machineName: "Table Print Machine 001"
    },
    jobWorkDetails: {
      isJobWork: false,
      jobWorkerId: null,
      jobWorkerName: null,
      jobWorkerRate: null,
      expectedDelivery: null
    },
    timing: {
      plannedStartTime: ISODate("2024-01-15T09:00:00Z"),
      actualStartTime: ISODate("2024-01-15T09:15:00Z"),
      plannedEndTime: ISODate("2024-01-15T17:00:00Z"),
      actualEndTime: ISODate("2024-01-15T16:45:00Z"),
      totalTime: 450 // in minutes
    },
    qualityCheck: {
      isRequired: true,
      checkedBy: ObjectId("QC_USER_ID"),
      checkedAt: ISODate("2024-01-15T17:00:00Z"),
      qualityGrade: "A",
      defects: ["Minor color variation in 2 pieces"],
      rejectedQuantity: 2.00,
      approvedQuantity: 98.00,
      notes: "Overall good quality, minor issues in 2 pieces"
    },
    materials: [{
      itemId: ObjectId("GREY_FABRIC_ID"),
      consumedQuantity: 580.00,
      wasteQuantity: 20.00
    }],
    output: {
      producedQuantity: 98.00,
      unit: "pieces",
      outputLocation: "Semi-Finished Warehouse"
    },
    notes: "Printing completed successfully",
    images: ["https://s3.amazonaws.com/production-images/stage1_001.jpg"],
    createdBy: ObjectId("USER_ID"),
    updatedBy: ObjectId("USER_ID"),
    createdAt: ISODate,
    updatedAt: ISODate
  }],
  priority: "high",
  status: "in_progress",
  plannedStartDate: ISODate("2024-01-15"),
  plannedEndDate: ISODate("2024-01-20"),
  actualStartDate: ISODate("2024-01-15"),
  actualEndDate: null,
  totalCost: {
    materialCost: 39100.00,
    laborCost: 2250.00,
    overheadCost: 750.00,
    totalCost: 42100.00
  },
  createdBy: ObjectId("USER_ID"),
  approvedBy: ObjectId("MANAGER_USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 3.3 Machine Master Collection
```javascript
// Collection: machines
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  machineCode: "PRINT_TABLE_001",
  machineName: "Table Printing Machine 001",
  machineType: "printing_machine", // printing_machine, washing_machine, fixing_machine, stitching_machine
  specifications: {
    capacity: 500, // meters per day
    powerConsumption: 15, // kW
    dimensions: "20ft x 4ft x 3ft",
    manufacturer: "Gujarat Machine Works",
    model: "GTP-2024",
    yearOfManufacture: 2023
  },
  location: {
    warehouseId: ObjectId("PRODUCTION_WAREHOUSE_ID"),
    floor: "Ground Floor",
    section: "Printing Section A"
  },
  operationalDetails: {
    status: "operational", // operational, maintenance, breakdown, idle
    currentOperator: ObjectId("OPERATOR_USER_ID"),
    currentJob: ObjectId("PRODUCTION_ORDER_ID"),
    utilizationHours: 8.5,
    maintenanceSchedule: ISODate("2024-02-01"),
    lastMaintenanceDate: ISODate("2024-01-01")
  },
  performanceMetrics: {
    totalRunningHours: 2400.0,
    totalProduction: 120000.0, // meters
    efficiency: 85.5, // percentage
    downtime: 120.0, // hours in current month
    qualityRating: 4.2 // out of 5
  },
  maintenanceHistory: [{
    maintenanceDate: ISODate("2024-01-01"),
    maintenanceType: "Preventive",
    description: "Regular cleaning and calibration",
    cost: 5000.00,
    performedBy: "Gujarat Machine Works",
    nextMaintenanceDate: ISODate("2024-02-01")
  }],
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 4. Order Management Models

### 4.1 Customer Master Collection
```javascript
// Collection: customers
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  customerCode: "CUST_DHRUVAL_001",
  customerName: "Rajesh Textiles Pvt Ltd",
  customerType: "business", // individual, business, export, wholesale, retail
  contactDetails: {
    primaryContact: {
      name: "Rajesh Patel",
      designation: "Purchase Manager",
      phone: "+91-9876543210",
      email: "rajesh@rateshtextiles.com"
    },
    alternateContact: {
      name: "Suresh Patel",
      phone: "+91-9876543211",
      email: "suresh@rateshtextiles.com"
    }
  },
  address: {
    billingAddress: {
      street: "123, Textile Market",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India"
    },
    shippingAddress: {
      street: "456, Warehouse Complex",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400002",
      country: "India"
    }
  },
  businessDetails: {
    gstin: "27XXXXX1234X1ZX",
    pan: "XXXXX1234X",
    businessType: "Textile Trading",
    creditLimit: 500000.00,
    creditDays: 30,
    paymentTerms: "30 days from invoice date"
  },
  preferences: {
    preferredProducts: ["Sarees", "African Cotton Fabric"],
    specialInstructions: "Pack carefully, fragile items",
    communicationPreference: "whatsapp"
  },
  salesHistory: {
    totalOrders: 25,
    totalValue: 1250000.00,
    lastOrderDate: ISODate("2024-01-10"),
    averageOrderValue: 50000.00
  },
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 4.2 Customer Order Collection
```javascript
// Collection: customer_orders
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  orderNumber: "ORD_DHRUVAL_2024_001",
  customerId: ObjectId("CUSTOMER_ID"),
  orderType: "local", // local, export, custom, sample
  orderSource: "direct", // direct, meesho, indiamart, website, phone, email
  orderItems: [{
    itemId: ObjectId("SAREE_INVENTORY_ID"),
    productType: "saree",
    specifications: {
      design: "Floral Print Design 001",
      color: "Red with Gold Border",
      gsm: 120,
      width: 44,
      length: 6,
      customRequirements: "Extra soft finish required"
    },
    quantity: 100.00,
    unit: "pieces",
    rate: 450.00,
    discount: 5.00, // percentage
    taxRate: 18.00,
    totalAmount: 42750.00,
    productionOrderId: ObjectId("PRODUCTION_ORDER_ID"),
    status: "in_production"
  }],
  orderSummary: {
    subtotal: 45000.00,
    totalDiscount: 2250.00,
    totalTax: 7695.00,
    shippingCharges: 500.00,
    totalAmount: 50945.00,
    advanceReceived: 15000.00,
    balanceAmount: 35945.00
  },
  deliveryDetails: {
    deliveryAddress: {
      name: "Rajesh Textiles Warehouse",
      phone: "+91-9876543210",
      street: "456, Warehouse Complex",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400002",
      country: "India"
    },
    expectedDeliveryDate: ISODate("2024-01-25"),
    actualDeliveryDate: null,
    deliveryInstructions: "Call before delivery, working hours 9 AM to 6 PM",
    courierPreference: "Blue Dart"
  },
  priority: "high",
  status: "confirmed", // draft, confirmed, in_production, ready_to_dispatch, dispatched, delivered, cancelled
  paymentStatus: "partial", // pending, partial, paid, overdue
  specialInstructions: "Rush order, priority production required",
  attachments: [
    "https://s3.amazonaws.com/order-docs/design_sample_001.jpg",
    "https://s3.amazonaws.com/order-docs/po_document_001.pdf"
  ],
  createdBy: ObjectId("USER_ID"),
  approvedBy: ObjectId("MANAGER_USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 4.3 Dispatch Management Collection
```javascript
// Collection: dispatches
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  dispatchNumber: "DISP_DHRUVAL_2024_001",
  orderId: ObjectId("CUSTOMER_ORDER_ID"),
  customerId: ObjectId("CUSTOMER_ID"),
  dispatchItems: [{
    orderItemId: ObjectId("ORDER_ITEM_ID"),
    itemId: ObjectId("SAREE_INVENTORY_ID"),
    dispatchedQuantity: 98.00,
    unit: "pieces",
    batchNumber: "BATCH_2024_001",
    qualityGrade: "A"
  }],
  packingDetails: {
    totalPackages: 2,
    packageType: "Cardboard Box",
    totalWeight: 15.5, // kg
    dimensions: {
      length: 60, // cm
      width: 40,
      height: 30
    },
    packingList: "https://s3.amazonaws.com/dispatch-docs/packing_list_001.pdf",
    invoice: "https://s3.amazonaws.com/dispatch-docs/invoice_001.pdf"
  },
  courierDetails: {
    courierCompany: "Blue Dart",
    awbNumber: "BD123456789",
    courierCharges: 500.00,
    expectedDelivery: ISODate("2024-01-18"),
    trackingUrl: "https://bluedart.com/track/BD123456789",
    courierContact: "+91-1800-123-4567"
  },
  lrDetails: {
    lrNumber: "LR_2024_001",
    transporterName: "Gujarat Transport",
    vehicleNumber: "GJ-05-AB-1234",
    driverName: "Ramesh Kumar",
    driverPhone: "+91-9876543210",
    lrDate: ISODate("2024-01-15"),
    lrAmount: 800.00
  },
  dispatchStatus: "dispatched", // packed, ready_to_dispatch, dispatched, in_transit, delivered, rto, lost
  trackingHistory: [{
    status: "Dispatched",
    location: "Surat Hub",
    timestamp: ISODate("2024-01-15T10:00:00Z"),
    remarks: "Package dispatched from origin",
    updatedBy: "Blue Dart System"
  }, {
    status: "In Transit",
    location: "Mumbai Hub",
    timestamp: ISODate("2024-01-16T08:00:00Z"),
    remarks: "Package reached destination hub",
    updatedBy: "Blue Dart System"
  }],
  deliveryConfirmation: {
    deliveredAt: null,
    receivedBy: null,
    receiverPhone: null,
    deliveryProof: null,
    customerFeedback: null,
    rating: null
  },
  returnDetails: {
    isReturned: false,
    returnReason: null,
    returnDate: null,
    returnCondition: null,
    actionTaken: null
  },
  gatePassDetails: {
    gatePassNumber: "GP_2024_001",
    securityApproval: {
      approvedBy: ObjectId("SECURITY_USER_ID"),
      approvedAt: ISODate("2024-01-15T09:30:00Z"),
      vehicleNumber: "GJ-05-AB-1234",
      driverName: "Ramesh Kumar",
      remarks: "All documents verified, dispatch approved"
    }
  },
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 5. Financial Management Models

### 5.1 Financial Transactions Collection
```javascript
// Collection: financial_transactions
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  transactionNumber: "TXN_DHRUVAL_2024_001",
  transactionType: "income", // income, expense, transfer
  category: "sales", // sales, purchase, salary, utility, hospitality, security, maintenance
  subCategory: "customer_payment", // customer_payment, supplier_payment, salary_payment, etc.
  amount: 50000.00,
  currency: "INR",
  paymentMethod: "bank_transfer", // cash, bank_transfer, upi, cheque, card
  paymentDetails: {
    bankAccountId: ObjectId("BANK_ACCOUNT_ID"),
    upiId: "merchant@paytm",
    chequeNumber: "123456",
    chequeDate: ISODate("2024-01-15"),
    referenceNumber: "REF123456789"
  },
  relatedEntity: {
    entityType: "customer", // customer, supplier, employee, vendor
    entityId: ObjectId("CUSTOMER_ID"),
    entityName: "Rajesh Textiles Pvt Ltd"
  },
  relatedDocument: {
    documentType: "invoice", // invoice, purchase_order, salary_slip, bill
    documentId: ObjectId("INVOICE_ID"),
    documentNumber: "INV_DHRUVAL_2024_001"
  },
  taxDetails: {
    gstAmount: 9000.00,
    cgst: 4500.00,
    sgst: 4500.00,
    igst: 0.00,
    tdsAmount: 0.00,
    tcsAmount: 0.00
  },
  description: "Payment received for Order ORD_DHRUVAL_2024_001",
  status: "completed", // pending, completed, cancelled, failed
  approvalDetails: {
    isApprovalRequired: true,
    approvedBy: ObjectId("MANAGER_USER_ID"),
    approvedAt: ISODate("2024-01-15T11:00:00Z"),
    approvalNotes: "Payment verified and approved"
  },
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 5.2 Supplier Management Collection
```javascript
// Collection: suppliers
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  supplierCode: "SUPP_DHRUVAL_001",
  supplierName: "Gujarat Textile Mills",
  supplierType: "raw_material", // raw_material, chemicals, machinery, services
  contactDetails: {
    primaryContact: {
      name: "Kiran Patel",
      designation: "Sales Manager",
      phone: "+91-9876543220",
      email: "kiran@gujarattextiles.com"
    },
    alternateContact: {
      name: "Nilesh Shah",
      phone: "+91-9876543221",
      email: "nilesh@gujarattextiles.com"
    }
  },
  address: {
    street: "Plot No. 789, Textile Park",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",
    country: "India"
  },
  businessDetails: {
    gstin: "24XXXXX5678X1ZX",
    pan: "XXXXX5678X",
    businessType: "Textile Manufacturing",
    creditLimit: 1000000.00,
    creditDays: 45,
    paymentTerms: "45 days from invoice date"
  },
  bankDetails: {
    bankName: "State Bank of India",
    accountNumber: "12345678901234",
    ifscCode: "SBIN0001234",
    accountHolderName: "Gujarat Textile Mills"
  },
  suppliedItems: [{
    itemId: ObjectId("GREY_FABRIC_ID"),
    itemName: "Grey Fabric 120 GSM",
    rate: 45.00,
    unit: "meters",
    lastSupplyDate: ISODate("2024-01-10"),
    qualityRating: 4.5
  }],
  performanceMetrics: {
    totalOrders: 15,
    totalValue: 675000.00,
    onTimeDelivery: 93.3, // percentage
    qualityRating: 4.2, // out of 5
    lastOrderDate: ISODate("2024-01-10")
  },
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 5.3 Purchase Order Collection
```javascript
// Collection: purchase_orders
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  purchaseOrderNumber: "PO_DHRUVAL_2024_001",
  supplierId: ObjectId("SUPPLIER_ID"),
  orderDate: ISODate("2024-01-15"),
  expectedDeliveryDate: ISODate("2024-01-20"),
  orderItems: [{
    itemId: ObjectId("GREY_FABRIC_ID"),
    itemName: "Grey Fabric 120 GSM White",
    specifications: {
      gsm: 120,
      color: "White",
      width: 44,
      quality: "A Grade"
    },
    quantity: 1000.00,
    unit: "meters",
    rate: 45.00,
    discount: 2.00, // percentage
    taxRate: 18.00,
    totalAmount: 44100.00
  }],
  orderSummary: {
    subtotal: 45000.00,
    totalDiscount: 900.00,
    totalTax: 7938.00,
    shippingCharges: 1000.00,
    totalAmount: 53038.00
  },
  deliveryAddress: {
    warehouseId: ObjectId("WAREHOUSE_ID"),
    contactPerson: "Suresh Patel",
    phone: "+91-9876543211",
    address: "Plot No. 456, Industrial Area, Surat, Gujarat - 395006"
  },
  paymentTerms: {
    paymentMethod: "bank_transfer",
    creditDays: 45,
    advancePercentage: 20.00,
    advanceAmount: 10607.60
  },
  status: "approved", // draft, approved, sent, acknowledged, delivered, completed, cancelled
  approvalDetails: {
    approvedBy: ObjectId("MANAGER_USER_ID"),
    approvedAt: ISODate("2024-01-15T10:00:00Z"),
    approvalNotes: "Approved for urgent requirement"
  },
  deliveryStatus: "pending", // pending, partial, completed, overdue
  attachments: [
    "https://s3.amazonaws.com/purchase-docs/po_001.pdf",
    "https://s3.amazonaws.com/purchase-docs/specifications_001.pdf"
  ],
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 6. Human Resource Management Models

### 6.1 Employee Master Collection
```javascript
// Collection: employees
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  employeeId: "EMP_DHRUVAL_001",
  personalDetails: {
    firstName: "Mahesh",
    lastName: "Kumar",
    fatherName: "Ramesh Kumar",
    dateOfBirth: ISODate("1990-05-15"),
    gender: "Male",
    maritalStatus: "Married",
    bloodGroup: "B+",
    aadharNumber: "1234-5678-9012",
    panNumber: "XXXXX1234X"
  },
  contactDetails: {
    phone: "+91-9876543230",
    alternatePhone: "+91-9876543231",
    email: "mahesh.kumar@dhruvalexim.com",
    currentAddress: {
      street: "123, Worker Colony",
      city: "Surat",
      state: "Gujarat",
      pincode: "395001"
    },
    permanentAddress: {
      street: "456, Village Gandhidham",
      city: "Kutch",
      state: "Gujarat",
      pincode: "370201"
    }
  },
  employmentDetails: {
    designation: "Table Printing Operator",
    department: "Production",
    joiningDate: ISODate("2022-01-15"),
    employmentType: "Permanent", // Permanent, Contract, Temporary
    workingHours: {
      shiftType: "Day", // Day, Night, Rotational
      startTime: "09:00",
      endTime: "18:00",
      breakTime: 60 // minutes
    },
    reportingManager: ObjectId("MANAGER_USER_ID"),
    skills: ["Table Printing", "Color Mixing", "Quality Control"]
  },
  salaryDetails: {
    basicSalary: 18000.00,
    hra: 7200.00,
    conveyanceAllowance: 2000.00,
    otherAllowances: 1800.00,
    grossSalary: 29000.00,
    pf: 2160.00,
    esi: 145.00,
    professionalTax: 200.00,
    tds: 0.00,
    totalDeductions: 2505.00,
    netSalary: 26495.00,
    paymentMode: "bank_transfer",
    bankDetails: {
      bankName: "HDFC Bank",
      accountNumber: "12345678901234",
      ifscCode: "HDFC0001234"
    }
  },
  attendancePolicy: {
    workingDaysPerMonth: 26,
    casualLeave: 12,
    sickLeave: 12,
    earnedLeave: 21,
    maternityLeave: 180,
    paternityLeave: 15
  },
  performanceMetrics: {
    productivityRating: 4.2, // out of 5
    qualityRating: 4.5,
    attendancePercentage: 96.5,
    lastAppraisalDate: ISODate("2023-04-01"),
    nextAppraisalDate: ISODate("2024-04-01")
  },
  documents: [{
    documentType: "Aadhar Card",
    documentUrl: "https://s3.amazonaws.com/employee-docs/aadhar_001.pdf",
    uploadedAt: ISODate
  }, {
    documentType: "PAN Card",
    documentUrl: "https://s3.amazonaws.com/employee-docs/pan_001.pdf",
    uploadedAt: ISODate
  }],
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 6.2 Attendance Tracking Collection
```javascript
// Collection: attendance
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  employeeId: ObjectId("EMPLOYEE_ID"),
  date: ISODate("2024-01-15"),
  shiftDetails: {
    shiftType: "Day",
    plannedStartTime: "09:00",
    plannedEndTime: "18:00",
    actualStartTime: "08:55",
    actualEndTime: "18:10",
    breakTime: 60, // minutes
    totalWorkedHours: 8.25
  },
  attendanceStatus: "Present", // Present, Absent, Half Day, Late, Early Leave
  checkInDetails: {
    checkInTime: ISODate("2024-01-15T08:55:00Z"),
    checkInMethod: "Biometric", // Biometric, Manual, Mobile App
    checkInLocation: "Main Gate",
    checkInBy: ObjectId("SECURITY_USER_ID")
  },
  checkOutDetails: {
    checkOutTime: ISODate("2024-01-15T18:10:00Z"),
    checkOutMethod: "Biometric",
    checkOutLocation: "Main Gate",
    checkOutBy: ObjectId("SECURITY_USER_ID")
  },
  overtimeDetails: {
    overtimeHours: 0.25,
    overtimeRate: 150.00,
    overtimeAmount: 37.50,
    isApproved: true,
    approvedBy: ObjectId("MANAGER_USER_ID")
  },
  leaveDetails: {
    isOnLeave: false,
    leaveType: null,
    leaveReason: null,
    leaveApprovedBy: null
  },
  productionWork: [{
    productionOrderId: ObjectId("PRODUCTION_ORDER_ID"),
    processId: ObjectId("PROCESS_ID"),
    hoursWorked: 8.0,
    outputProduced: 50.0,
    unit: "meters"
  }],
  notes: "Regular working day",
  createdBy: ObjectId("SYSTEM_USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 7. Security & Gate Management Models

### 7.1 Security Staff Collection
```javascript
// Collection: security_staff
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  guardId: "GUARD_DHRUVAL_001",
  personalDetails: {
    name: "Ravi Singh",
    fatherName: "Mohan Singh",
    phone: "+91-9876543240",
    address: "789, Security Colony, Surat",
    aadharNumber: "9876-5432-1098",
    policeVerification: {
      isVerified: true,
      verificationNumber: "PV_2023_001",
      verificationDate: ISODate("2023-12-01"),
      validTill: ISODate("2024-12-01")
    }
  },
  dutyDetails: {
    shiftType: "Night", // Day, Night, Rotational
    dutyStartTime: "18:00",
    dutyEndTime: "06:00",
    assignedGate: "Main Gate",
    responsibilities: [
      "Vehicle Entry/Exit Monitoring",
      "Visitor Management",
      "Material Gate Pass Verification",
      "CCTV Monitoring"
    ]
  },
  performanceMetrics: {
    attendancePercentage: 98.5,
    incidentReports: 2,
    customerComplaints: 0,
    rating: 4.3
  },
  isActive: true,
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 7.2 Vehicle Entry/Exit Log Collection
```javascript
// Collection: vehicle_logs
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  vehicleNumber: "GJ-05-AB-1234",
  vehicleType: "Truck", // Truck, Car, Bike, Tempo, Container
  driverDetails: {
    driverName: "Ramesh Kumar",
    driverPhone: "+91-9876543250",
    licenseNumber: "GJ-1234567890",
    licenseExpiry: ISODate("2025-12-31")
  },
  visitPurpose: "Material Delivery", // Material Delivery, Material Pickup, Maintenance, Official Visit
  entryDetails: {
    entryTime: ISODate("2024-01-15T10:00:00Z"),
    entryGate: "Main Gate",
    securityGuard: ObjectId("SECURITY_STAFF_ID"),
    documentsVerified: ["Driving License", "Vehicle RC", "Delivery Challan"],
    entryRemarks: "All documents verified, material delivery for PO_001"
  },
  exitDetails: {
    exitTime: ISODate("2024-01-15T12:30:00Z"),
    exitGate: "Main Gate",
    securityGuard: ObjectId("SECURITY_STAFF_ID"),
    exitRemarks: "Material delivered successfully, empty vehicle exit"
  },
  materialDetails: {
    isCarryingMaterial: true,
    materialType: "Raw Material", // Raw Material, Finished Goods, Empty, Others
    relatedDocument: {
      documentType: "Purchase Order",
      documentId: ObjectId("PURCHASE_ORDER_ID"),
      documentNumber: "PO_DHRUVAL_2024_001"
    },
    gatePassNumber: "GP_2024_001"
  },
  visitDuration: 150, // minutes
  status: "Completed", // In Progress, Completed, Overstay
  createdBy: ObjectId("SECURITY_USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 7.3 Visitor Management Collection
```javascript
// Collection: visitors
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  visitorDetails: {
    name: "Suresh Patel",
    phone: "+91-9876543260",
    email: "suresh@example.com",
    company: "ABC Textiles",
    designation: "Purchase Manager",
    idProof: {
      idType: "Aadhar Card", // Aadhar Card, PAN Card, Driving License, Passport
      idNumber: "1234-5678-9012",
      idPhotoUrl: "https://s3.amazonaws.com/visitor-docs/id_001.jpg"
    },
    visitorPhotoUrl: "https://s3.amazonaws.com/visitor-photos/visitor_001.jpg"
  },
  visitDetails: {
    visitPurpose: "Business Meeting", // Business Meeting, Delivery, Maintenance, Interview, Others
    personToMeet: {
      employeeId: ObjectId("EMPLOYEE_ID"),
      employeeName: "Rajesh Patel",
      department: "Sales"
    },
    expectedDuration: 120, // minutes
    visitDate: ISODate("2024-01-15"),
    appointmentScheduled: true,
    appointmentTime: ISODate("2024-01-15T14:00:00Z")
  },
  entryDetails: {
    entryTime: ISODate("2024-01-15T14:05:00Z"),
    entryGate: "Main Gate",
    securityGuard: ObjectId("SECURITY_STAFF_ID"),
    badgeNumber: "VISITOR_001",
    escortRequired: false,
    escortedBy: null,
    entryRemarks: "Visitor arrived for scheduled meeting"
  },
  exitDetails: {
    exitTime: ISODate("2024-01-15T16:00:00Z"),
    exitGate: "Main Gate",
    securityGuard: ObjectId("SECURITY_STAFF_ID"),
    badgeReturned: true,
    exitRemarks: "Meeting completed, visitor departed"
  },
  visitSummary: {
    actualDuration: 115, // minutes
    meetingOutcome: "Successful business discussion",
    followUpRequired: true,
    nextVisitScheduled: ISODate("2024-02-15")
  },
  status: "Completed", // Scheduled, In Progress, Completed, Cancelled, Overstay
  createdBy: ObjectId("SECURITY_USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 7.4 Material Gate Pass Collection
```javascript
// Collection: gate_passes
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  gatePassNumber: "GP_DHRUVAL_2024_001",
  gatePassType: "Outward", // Inward, Outward, Transfer
  relatedDocument: {
    documentType: "Dispatch", // Purchase Order, Dispatch, Transfer, Return
    documentId: ObjectId("DISPATCH_ID"),
    documentNumber: "DISP_DHRUVAL_2024_001"
  },
  materialDetails: [{
    itemId: ObjectId("INVENTORY_ITEM_ID"),
    itemName: "Printed Saree - Red Floral",
    quantity: 100.00,
    unit: "pieces",
    rate: 450.00,
    totalValue: 45000.00,
    batchNumber: "BATCH_2024_001"
  }],
  transportDetails: {
    vehicleNumber: "GJ-05-AB-1234",
    driverName: "Ramesh Kumar",
    driverPhone: "+91-9876543250",
    transporterName: "Gujarat Transport",
    courierCompany: "Blue Dart",
    awbNumber: "BD123456789"
  },
  approvalDetails: {
    requestedBy: ObjectId("USER_ID"),
    requestedAt: ISODate("2024-01-15T09:00:00Z"),
    approvedBy: ObjectId("MANAGER_USER_ID"),
    approvedAt: ISODate("2024-01-15T09:30:00Z"),
    approvalRemarks: "Dispatch approved for customer order"
  },
  securityVerification: {
    verifiedBy: ObjectId("SECURITY_USER_ID"),
    verifiedAt: ISODate("2024-01-15T10:00:00Z"),
    documentsChecked: ["Invoice", "Packing List", "Transport LR"],
    physicalVerification: true,
    verificationRemarks: "All items verified and match with documents"
  },
  gatePassStatus: "Completed", // Pending, Approved, In Transit, Completed, Cancelled
  validTill: ISODate("2024-01-15T18:00:00Z"),
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 8. Utility & Expense Management Models

### 8.1 Electricity Management Collection
```javascript
// Collection: electricity_management
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  month: "2024-01",
  pgvclDetails: {
    meterNumber: "PGVCL_123456",
    previousReading: 15000,
    currentReading: 18500,
    unitsConsumed: 3500,
    ratePerUnit: 6.50,
    fixedCharges: 500.00,
    totalAmount: 23250.00,
    billDate: ISODate("2024-01-05"),
    dueDate: ISODate("2024-01-25"),
    paymentStatus: "Paid",
    paymentDate: ISODate("2024-01-20")
  },
  solarDetails: {
    solarCapacity: 100, // kW
    unitsGenerated: 2800,
    unitsConsumed: 2500,
    unitsSoldToGrid: 300,
    ratePerUnitSold: 3.50,
    amountReceived: 1050.00,
    maintenanceCost: 2000.00,
    netSaving: 16250.00 // PGVCL cost saved
  },
  totalElectricityCost: 7000.00, // Net cost after solar savings
  costAllocation: [{
    department: "Production",
    percentage: 70.0,
    allocatedCost: 4900.00
  }, {
    department: "Office",
    percentage: 20.0,
    allocatedCost: 1400.00
  }, {
    department: "Warehouse",
    percentage: 10.0,
    allocatedCost: 700.00
  }],
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### 8.2 Hospitality Expenses Collection
```javascript
// Collection: hospitality_expenses
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  expenseNumber: "HOSP_DHRUVAL_2024_001",
  customerVisit: {
    customerId: ObjectId("CUSTOMER_ID"),
    customerName: "Rajesh Textiles Pvt Ltd",
    visitDate: ISODate("2024-01-15"),
    visitPurpose: "Business Discussion - New Order",
    visitorsCount: 3,
    visitDuration: 4 // hours
  },
  expenseDetails: {
    hotelExpenses: {
      hotelName: "Hotel Grand Palace",
      roomType: "Deluxe",
      numberOfRooms: 2,
      numberOfNights: 1,
      ratePerRoom: 3500.00,
      totalHotelCost: 7000.00,
      hotelBillUrl: "https://s3.amazonaws.com/expense-docs/hotel_bill_001.pdf"
    },
    foodExpenses: {
      breakfast: 1500.00,
      lunch: 2500.00,
      dinner: 3000.00,
      snacks: 800.00,
      totalFoodCost: 7800.00,
      restaurantDetails: "Hotel Restaurant + Local Restaurant"
    },
    transportExpenses: {
      airportPickup: 800.00,
      localTransport: 1200.00,
      airportDrop: 800.00,
      totalTransportCost: 2800.00,
      transportMode: "Taxi"
    },
    giftExpenses: {
      giftType: "Corporate Gift Set",
      giftValue: 2500.00,
      giftDescription: "Premium gift hamper with company branding"
    },
    otherExpenses: {
      miscellaneous: 500.00,
      tips: 300.00,
      totalOtherCost: 800.00
    }
  },
  expenseSummary: {
    totalHospitalityCost: 20900.00,
    gstAmount: 3762.00,
    totalCostIncludingGST: 24662.00,
    approvedAmount: 24662.00
  },
  businessOutcome: {
    orderReceived: true,
    orderValue: 500000.00,
    orderId: ObjectId("CUSTOMER_ORDER_ID"),
    roi: 2027.0, // percentage (order value / hospitality cost * 100)
    followUpRequired: false
  },
  approvalDetails: {
    requestedBy: ObjectId("SALES_USER_ID"),
    approvedBy: ObjectId("MANAGER_USER_ID"),
    approvedAt: ISODate("2024-01-16T10:00:00Z"),
    approvalNotes: "Approved - Good ROI achieved"
  },
  attachments: [
    "https://s3.amazonaws.com/expense-docs/hotel_bill_001.pdf",
    "https://s3.amazonaws.com/expense-docs/food_bills_001.pdf",
    "https://s3.amazonaws.com/expense-docs/transport_bills_001.pdf"
  ],
  createdBy: ObjectId("USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 9. Audit & Tracking Models

### 9.1 System Audit Log Collection
```javascript
// Collection: audit_logs
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  userId: ObjectId("USER_ID"),
  userName: "Rajesh Patel",
  userRole: "manager",
  action: "UPDATE", // CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
  resource: "inventory", // inventory, production, orders, financial, security
  resourceId: ObjectId("INVENTORY_ITEM_ID"),
  resourceName: "Grey Fabric 120 GSM White",
  changes: {
    before: {
      currentStock: 4000.00,
      availableStock: 3500.00
    },
    after: {
      currentStock: 5000.00,
      availableStock: 4500.00
    }
  },
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  sessionId: "session_123456789",
  timestamp: ISODate("2024-01-15T10:30:00Z"),
  severity: "INFO", // INFO, WARN, ERROR, CRITICAL
  description: "Stock updated after material inward",
  additionalData: {
    referenceDocument: "PO_DHRUVAL_2024_001",
    batchNumber: "BATCH_2024_001",
    gatePassNumber: "GP_2024_001"
  }
}
```

### 9.2 Business Analytics Collection
```javascript
// Collection: business_analytics
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  analyticsType: "daily_summary", // daily_summary, weekly_summary, monthly_summary
  date: ISODate("2024-01-15"),
  inventoryMetrics: {
    totalRawMaterialValue: 2500000.00,
    totalSemiFinishedValue: 800000.00,
    totalFinishedGoodsValue: 1200000.00,
    totalInventoryValue: 4500000.00,
    lowStockItems: 15,
    outOfStockItems: 3,
    fastMovingItems: ["Grey Fabric 120 GSM", "Printing Paste Red"],
    slowMovingItems: ["Special Design Fabric"]
  },
  productionMetrics: {
    totalProductionOrders: 25,
    completedOrders: 18,
    inProgressOrders: 5,
    pendingOrders: 2,
    totalProductionValue: 1800000.00,
    machineUtilization: 85.5, // percentage
    qualityRejectionRate: 2.3, // percentage
    onTimeDelivery: 92.0 // percentage
  },
  salesMetrics: {
    totalOrders: 30,
    totalSalesValue: 2200000.00,
    newCustomers: 3,
    repeatCustomers: 12,
    averageOrderValue: 73333.33,
    topSellingProducts: ["Sarees", "African Cotton Fabric"],
    salesByRegion: {
      "Gujarat": 40.0,
      "Maharashtra": 30.0,
      "Rajasthan": 20.0,
      "Others": 10.0
    }
  },
  financialMetrics: {
    totalRevenue: 2200000.00,
    totalExpenses: 1650000.00,
    grossProfit: 550000.00,
    grossProfitMargin: 25.0, // percentage
    outstandingReceivables: 800000.00,
    outstandingPayables: 450000.00,
    cashFlow: 350000.00
  },
  operationalMetrics: {
    totalEmployees: 45,
    presentEmployees: 42,
    attendancePercentage: 93.3,
    overtimeHours: 120.0,
    securityIncidents: 0,
    visitorCount: 8,
    vehicleMovements: 15
  },
  createdBy: ObjectId("SYSTEM_USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## 10. Integration & External Data Models

### 10.1 Third-party Integration Logs
```javascript
// Collection: integration_logs
{
  _id: ObjectId,
  companyId: ObjectId("DHRUVAL_COMPANY_ID"),
  integrationType: "tally_sync", // tally_sync, meesho_orders, indiamart_leads, courier_tracking
  integrationDirection: "outbound", // inbound, outbound, bidirectional
  operationType: "sync_transactions", // sync_transactions, fetch_orders, update_inventory, track_shipment
  requestData: {
    transactionIds: ["TXN_001", "TXN_002"],
    dateRange: {
      startDate: ISODate("2024-01-01"),
      endDate: ISODate("2024-01-15")
    }
  },
  responseData: {
    status: "success",
    recordsProcessed: 25,
    recordsSuccess: 23,
    recordsFailed: 2,
    errorDetails: [
      {
        recordId: "TXN_024",
        error: "Invalid GST number format"
      }
    ]
  },
  executionDetails: {
    startTime: ISODate("2024-01-15T10:00:00Z"),
    endTime: ISODate("2024-01-15T10:05:30Z"),
    executionTime: 330, // seconds
    apiEndpoint: "https://api.tally.com/v1/transactions/sync",
    httpStatus: 200
  },
  status: "completed", // pending, in_progress, completed, failed, partial_success
  createdBy: ObjectId("SYSTEM_USER_ID"),
  createdAt: ISODate,
  updatedAt: ISODate
}
```

## Database Indexes and Performance Optimization

### Critical Indexes for Performance
```javascript
// Company-wise data segregation indexes
db.inventory.createIndex({ "companyId": 1, "itemType": 1, "isActive": 1 })
db.production_orders.createIndex({ "companyId": 1, "status": 1, "priority": 1 })
db.customer_orders.createIndex({ "companyId": 1, "customerId": 1, "status": 1 })
db.stock_movements.createIndex({ "companyId": 1, "itemId": 1, "createdAt": -1 })
db.financial_transactions.createIndex({ "companyId": 1, "transactionType": 1, "createdAt": -1 })

// Search and filtering indexes
db.inventory.createIndex({ "itemName": "text", "itemCode": "text" })
db.customers.createIndex({ "customerName": "text", "customerCode": "text" })
db.employees.createIndex({ "personalDetails.firstName": "text", "personalDetails.lastName": "text" })

// Performance optimization indexes
db.audit_logs.createIndex({ "companyId": 1, "timestamp": -1 }, { expireAfterSeconds: 7776000 }) // 90 days
db.integration_logs.createIndex({ "companyId": 1, "createdAt": -1 }, { expireAfterSeconds: 2592000 }) // 30 days
```

This comprehensive MongoDB data model ensures complete company-wise tracking with full audit trail for all business operations across Dhruval Exim, Jinal Industries, and Vimal Process.
```
```
```
```
