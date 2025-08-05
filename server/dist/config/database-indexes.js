"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_INDEXES = void 0;
exports.createDatabaseIndexes = createDatabaseIndexes;
exports.dropAllIndexes = dropAllIndexes;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
exports.DATABASE_INDEXES = [
    {
        collection: 'companies',
        indexes: [
            {
                fields: { companyCode: 1 },
                options: { unique: true },
                description: 'Unique company code lookup'
            },
            {
                fields: { email: 1 },
                options: { unique: true },
                description: 'Unique email lookup'
            },
            {
                fields: { isActive: 1, createdAt: -1 },
                description: 'Active companies with recent first'
            }
        ]
    },
    {
        collection: 'users',
        indexes: [
            {
                fields: { email: 1 },
                options: { unique: true },
                description: 'Unique email lookup for authentication'
            },
            {
                fields: { companyId: 1, isActive: 1 },
                description: 'Company users lookup'
            },
            {
                fields: { companyId: 1, role: 1 },
                description: 'Users by company and role'
            },
            {
                fields: { employeeId: 1, companyId: 1 },
                options: { unique: true },
                description: 'Unique employee ID per company'
            },
            {
                fields: { lastLoginAt: -1 },
                description: 'Recent login tracking'
            }
        ]
    },
    {
        collection: 'customers',
        indexes: [
            {
                fields: { companyId: 1, customerCode: 1 },
                options: { unique: true },
                description: 'Unique customer code per company'
            },
            {
                fields: { companyId: 1, isActive: 1 },
                description: 'Active customers by company'
            },
            {
                fields: { companyId: 1, 'contactInfo.email': 1 },
                description: 'Customer email lookup'
            },
            {
                fields: { companyId: 1, 'contactInfo.phone': 1 },
                description: 'Customer phone lookup'
            },
            {
                fields: { companyId: 1, 'financialInfo.creditLimit': -1 },
                description: 'Customers by credit limit'
            },
            {
                fields: { companyId: 1, 'financialInfo.outstandingAmount': -1 },
                description: 'Customers by outstanding amount'
            }
        ]
    },
    {
        collection: 'suppliers',
        indexes: [
            {
                fields: { companyId: 1, supplierCode: 1 },
                options: { unique: true },
                description: 'Unique supplier code per company'
            },
            {
                fields: { companyId: 1, isActive: 1 },
                description: 'Active suppliers by company'
            },
            {
                fields: { companyId: 1, category: 1 },
                description: 'Suppliers by category'
            },
            {
                fields: { companyId: 1, 'performanceMetrics.overallRating': -1 },
                description: 'Suppliers by rating'
            }
        ]
    },
    {
        collection: 'inventory_items',
        indexes: [
            {
                fields: { companyId: 1, itemCode: 1 },
                options: { unique: true },
                description: 'Unique item code per company'
            },
            {
                fields: { companyId: 1, isActive: 1 },
                description: 'Active items by company'
            },
            {
                fields: { companyId: 1, category: 1 },
                description: 'Items by category'
            },
            {
                fields: { companyId: 1, currentStock: 1 },
                description: 'Items by stock level'
            },
            {
                fields: { companyId: 1, reorderLevel: 1, currentStock: 1 },
                description: 'Low stock items detection'
            },
            {
                fields: { companyId: 1, unitPrice: -1 },
                description: 'Items by price'
            },
            {
                fields: { itemName: 'text', description: 'text' },
                options: { name: 'item_text_search' },
                description: 'Text search on item name and description'
            }
        ]
    },
    {
        collection: 'stock_movements',
        indexes: [
            {
                fields: { companyId: 1, movementDate: -1 },
                description: 'Recent stock movements by company'
            },
            {
                fields: { companyId: 1, itemId: 1, movementDate: -1 },
                description: 'Item movement history'
            },
            {
                fields: { companyId: 1, movementType: 1, movementDate: -1 },
                description: 'Movements by type'
            },
            {
                fields: { companyId: 1, warehouseId: 1, movementDate: -1 },
                description: 'Warehouse movements'
            },
            {
                fields: { companyId: 1, referenceType: 1, referenceId: 1 },
                description: 'Movements by reference'
            }
        ]
    },
    {
        collection: 'production_orders',
        indexes: [
            {
                fields: { companyId: 1, productionOrderNumber: 1 },
                options: { unique: true },
                description: 'Unique production order number'
            },
            {
                fields: { companyId: 1, status: 1, startDate: -1 },
                description: 'Production orders by status and date'
            },
            {
                fields: { companyId: 1, itemId: 1, startDate: -1 },
                description: 'Production orders by item'
            },
            {
                fields: { companyId: 1, priority: 1, startDate: 1 },
                description: 'Production orders by priority'
            },
            {
                fields: { companyId: 1, endDate: 1 },
                description: 'Production orders by end date'
            }
        ]
    },
    {
        collection: 'customer_orders',
        indexes: [
            {
                fields: { companyId: 1, orderNumber: 1 },
                options: { unique: true },
                description: 'Unique order number'
            },
            {
                fields: { companyId: 1, customerId: 1, orderDate: -1 },
                description: 'Customer order history'
            },
            {
                fields: { companyId: 1, status: 1, orderDate: -1 },
                description: 'Orders by status'
            },
            {
                fields: { companyId: 1, deliveryDate: 1 },
                description: 'Orders by delivery date'
            },
            {
                fields: { companyId: 1, totalAmount: -1 },
                description: 'Orders by value'
            }
        ]
    },
    {
        collection: 'invoices',
        indexes: [
            {
                fields: { companyId: 1, invoiceNumber: 1 },
                options: { unique: true },
                description: 'Unique invoice number'
            },
            {
                fields: { companyId: 1, customerId: 1, invoiceDate: -1 },
                description: 'Customer invoice history'
            },
            {
                fields: { companyId: 1, status: 1, invoiceDate: -1 },
                description: 'Invoices by status'
            },
            {
                fields: { companyId: 1, dueDate: 1 },
                description: 'Invoices by due date'
            },
            {
                fields: { companyId: 1, totalAmount: -1 },
                description: 'Invoices by amount'
            },
            {
                fields: { companyId: 1, paymentStatus: 1, dueDate: 1 },
                description: 'Payment tracking'
            }
        ]
    },
    {
        collection: 'purchase_orders',
        indexes: [
            {
                fields: { companyId: 1, purchaseOrderNumber: 1 },
                options: { unique: true },
                description: 'Unique purchase order number'
            },
            {
                fields: { companyId: 1, supplierId: 1, orderDate: -1 },
                description: 'Supplier order history'
            },
            {
                fields: { companyId: 1, status: 1, orderDate: -1 },
                description: 'Purchase orders by status'
            },
            {
                fields: { companyId: 1, expectedDeliveryDate: 1 },
                description: 'Purchase orders by delivery date'
            },
            {
                fields: { companyId: 1, grandTotal: -1 },
                description: 'Purchase orders by value'
            }
        ]
    },
    {
        collection: 'quotations',
        indexes: [
            {
                fields: { companyId: 1, quotationNumber: 1 },
                options: { unique: true },
                description: 'Unique quotation number'
            },
            {
                fields: { companyId: 1, customerId: 1, quotationDate: -1 },
                description: 'Customer quotation history'
            },
            {
                fields: { companyId: 1, status: 1, quotationDate: -1 },
                description: 'Quotations by status'
            },
            {
                fields: { companyId: 1, validUntil: 1 },
                description: 'Quotations by validity'
            }
        ]
    },
    {
        collection: 'warehouses',
        indexes: [
            {
                fields: { companyId: 1, warehouseCode: 1 },
                options: { unique: true },
                description: 'Unique warehouse code'
            },
            {
                fields: { companyId: 1, isActive: 1 },
                description: 'Active warehouses'
            },
            {
                fields: { companyId: 1, warehouseType: 1 },
                description: 'Warehouses by type'
            }
        ]
    },
    {
        collection: 'vehicles',
        indexes: [
            {
                fields: { companyId: 1, vehicleNumber: 1 },
                options: { unique: true },
                description: 'Unique vehicle number'
            },
            {
                fields: { companyId: 1, isActive: 1 },
                description: 'Active vehicles'
            },
            {
                fields: { companyId: 1, vehicleType: 1 },
                description: 'Vehicles by type'
            },
            {
                fields: { companyId: 1, 'maintenance.nextServiceDate': 1 },
                description: 'Vehicles by service date'
            }
        ]
    },
    {
        collection: 'visitors',
        indexes: [
            {
                fields: { companyId: 1, visitDate: -1 },
                description: 'Recent visitors by company'
            },
            {
                fields: { companyId: 1, currentStatus: 1, visitDate: -1 },
                description: 'Visitors by status'
            },
            {
                fields: { companyId: 1, approvalStatus: 1 },
                description: 'Visitors by approval status'
            },
            {
                fields: { companyId: 1, 'contactInfo.phone': 1 },
                description: 'Visitor phone lookup'
            },
            {
                fields: { companyId: 1, 'hostInfo.hostEmployeeId': 1, visitDate: -1 },
                description: 'Visitors by host'
            }
        ]
    },
    {
        collection: 'roles',
        indexes: [
            {
                fields: { companyId: 1, roleName: 1 },
                options: { unique: true },
                description: 'Unique role name per company'
            },
            {
                fields: { companyId: 1, isActive: 1 },
                description: 'Active roles'
            }
        ]
    },
    {
        collection: 'financial_transactions',
        indexes: [
            {
                fields: { companyId: 1, transactionDate: -1 },
                description: 'Recent transactions by company'
            },
            {
                fields: { companyId: 1, transactionType: 1, transactionDate: -1 },
                description: 'Transactions by type'
            },
            {
                fields: { companyId: 1, status: 1, transactionDate: -1 },
                description: 'Transactions by status'
            },
            {
                fields: { companyId: 1, amount: -1 },
                description: 'Transactions by amount'
            },
            {
                fields: { companyId: 1, referenceType: 1, referenceId: 1 },
                description: 'Transactions by reference'
            }
        ]
    },
    {
        collection: 'audit_logs',
        indexes: [
            {
                fields: { companyId: 1, timestamp: -1 },
                description: 'Recent audit logs by company'
            },
            {
                fields: { companyId: 1, action: 1, timestamp: -1 },
                description: 'Audit logs by action'
            },
            {
                fields: { companyId: 1, userId: 1, timestamp: -1 },
                description: 'Audit logs by user'
            },
            {
                fields: { companyId: 1, resourceType: 1, timestamp: -1 },
                description: 'Audit logs by resource type'
            }
        ]
    },
    {
        collection: 'security_logs',
        indexes: [
            {
                fields: { companyId: 1, eventDateTime: -1 },
                description: 'Recent security events'
            },
            {
                fields: { companyId: 1, eventType: 1, eventDateTime: -1 },
                description: 'Security events by type'
            },
            {
                fields: { companyId: 1, priority: 1, eventDateTime: -1 },
                description: 'Security events by priority'
            }
        ]
    },
    {
        collection: 'business_analytics',
        indexes: [
            {
                fields: { companyId: 1, analyticsId: 1 },
                options: { unique: true },
                description: 'Unique analytics ID'
            },
            {
                fields: { companyId: 1, createdAt: -1 },
                description: 'Recent analytics by company'
            }
        ]
    },
    {
        collection: 'boiler_monitorings',
        indexes: [
            {
                fields: { companyId: 1, boilerId: 1 },
                options: { unique: true },
                description: 'Unique boiler ID per company'
            },
            {
                fields: { companyId: 1, 'currentStatus.operationalStatus': 1 },
                description: 'Boilers by operational status'
            },
            {
                fields: { companyId: 1, createdAt: -1 },
                description: 'Recent boiler data'
            }
        ]
    },
    {
        collection: 'electricity_monitorings',
        indexes: [
            {
                fields: { companyId: 1, monitoringId: 1 },
                options: { unique: true },
                description: 'Unique monitoring ID per company'
            },
            {
                fields: { companyId: 1, 'currentStatus.operationalStatus': 1 },
                description: 'Monitoring systems by status'
            },
            {
                fields: { companyId: 1, createdAt: -1 },
                description: 'Recent electricity data'
            }
        ]
    },
    {
        collection: 'hospitalities',
        indexes: [
            {
                fields: { companyId: 1, facilityId: 1 },
                options: { unique: true },
                description: 'Unique facility ID per company'
            },
            {
                fields: { companyId: 1, facilityType: 1 },
                description: 'Facilities by type'
            },
            {
                fields: { companyId: 1, createdAt: -1 },
                description: 'Recent hospitality data'
            }
        ]
    },
    {
        collection: 'dispatches',
        indexes: [
            {
                fields: { companyId: 1, dispatchNumber: 1 },
                options: { unique: true },
                description: 'Unique dispatch number'
            },
            {
                fields: { companyId: 1, dispatchDate: -1 },
                description: 'Recent dispatches'
            },
            {
                fields: { companyId: 1, dispatchType: 1, dispatchDate: -1 },
                description: 'Dispatches by type'
            },
            {
                fields: { companyId: 1, priority: 1, dispatchDate: -1 },
                description: 'Dispatches by priority'
            }
        ]
    },
    {
        collection: 'reports',
        indexes: [
            {
                fields: { companyId: 1, reportId: 1 },
                options: { unique: true },
                description: 'Unique report ID'
            },
            {
                fields: { companyId: 1, category: 1, createdAt: -1 },
                description: 'Reports by category'
            },
            {
                fields: { companyId: 1, reportType: 1, createdAt: -1 },
                description: 'Reports by type'
            }
        ]
    }
];
async function createDatabaseIndexes() {
    try {
        let totalIndexes = 0;
        let createdIndexes = 0;
        let existingIndexes = 0;
        let errorCount = 0;
        for (const config of exports.DATABASE_INDEXES) {
            const collection = mongoose_1.default.connection.collection(config.collection);
            for (const indexConfig of config.indexes) {
                totalIndexes++;
                try {
                    await collection.createIndex(indexConfig.fields, indexConfig.options || {});
                    createdIndexes++;
                }
                catch (error) {
                    if (error.code === 11000 || error.codeName === 'IndexOptionsConflict' || error.code === 86) {
                        existingIndexes++;
                    }
                    else {
                        errorCount++;
                        logger_1.logger.error(`❌ Failed to create index for ${config.collection}: ${indexConfig.description}`, error);
                    }
                }
            }
        }
        logger_1.logger.info(`📊 Database indexes summary: ${totalIndexes} total, ${createdIndexes} created, ${existingIndexes} existing, ${errorCount} errors`);
    }
    catch (error) {
        logger_1.logger.error('❌ Error creating database indexes:', error);
        throw error;
    }
}
async function dropAllIndexes() {
    try {
        logger_1.logger.info('Dropping all custom indexes...');
        for (const config of exports.DATABASE_INDEXES) {
            const collection = mongoose_1.default.connection.collection(config.collection);
            try {
                const indexes = await collection.listIndexes().toArray();
                for (const index of indexes) {
                    if (index.name !== '_id_') {
                        await collection.dropIndex(index.name);
                        logger_1.logger.info(`Dropped index ${index.name} from ${config.collection}`);
                    }
                }
            }
            catch (error) {
                logger_1.logger.warn(`Failed to drop indexes for ${config.collection}:`, error);
            }
        }
        logger_1.logger.info('Index dropping completed');
    }
    catch (error) {
        logger_1.logger.error('Error dropping indexes:', error);
        throw error;
    }
}
//# sourceMappingURL=database-indexes.js.map