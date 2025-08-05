// =============================================
// FACTORY ERP MODELS INDEX
// =============================================
// Central export file for all MongoDB models
// This ensures proper model registration and prevents circular dependencies

import Company from './Company';
import User from './User';
import InventoryItem from './InventoryItem';
import StockMovement from './StockMovement';
import ProductionOrder from './ProductionOrder';
import CustomerOrder from './CustomerOrder';
import Customer from './Customer';
import CustomerVisit from './CustomerVisit';
import Supplier from './Supplier';
import FinancialTransaction from './FinancialTransaction';
import AuditLog from './AuditLog';
import Role from './Role';
import Visitor from './Visitor';
import Vehicle from './Vehicle';
import SecurityLog from './SecurityLog';
import Warehouse from './Warehouse';
import Invoice from './Invoice';
import PurchaseOrder from './PurchaseOrder';
import Quotation from './Quotation';
import BusinessAnalytics from './BusinessAnalytics';
import BoilerMonitoring from './BoilerMonitoring';
import ElectricityMonitoring from './ElectricityMonitoring';
import Hospitality from './Hospitality';
import Dispatch from './Dispatch';
import Report from './Report';
import Spare from './Spare';

// Additional models (to be created in future)
// import Warehouse from './Warehouse';
// import SecurityLog from './SecurityLog';
// import BusinessAnalytics from './BusinessAnalytics';
// import BoilerMonitoring from './BoilerMonitoring';
// import ElectricityMonitoring from './ElectricityMonitoring';
// import Hospitality from './Hospitality';
// import Dispatch from './Dispatch';
// import Invoice from './Invoice';
// import PurchaseOrder from './PurchaseOrder';
// import Quotation from './Quotation';
// import Report from './Report';

// Export all models
export {
  Company,
  User,
  InventoryItem,
  StockMovement,
  ProductionOrder,
  CustomerOrder,
  Customer,
  CustomerVisit,
  Supplier,
  FinancialTransaction,
  AuditLog,
  Role,
  Visitor,
  Vehicle,
  SecurityLog,
  Warehouse,
  Invoice,
  PurchaseOrder,
  Quotation,
  BusinessAnalytics,
  BoilerMonitoring,
  ElectricityMonitoring,
  Hospitality,
  Dispatch,
  Report,
  Spare
};

// Default export with all models
export default {
  Company,
  User,
  InventoryItem,
  StockMovement,
  ProductionOrder,
  CustomerOrder,
  Customer,
  CustomerVisit,
  Supplier,
  FinancialTransaction,
  AuditLog,
  Role,
  Visitor,
  Vehicle,
  SecurityLog,
  Warehouse,
  Invoice,
  PurchaseOrder,
  Quotation,
  BusinessAnalytics,
  BoilerMonitoring,
  ElectricityMonitoring,
  Hospitality,
  Dispatch,
  Report,
  Spare
};

// Model registration function
export const registerModels = () => {
  // This function ensures all models are registered with Mongoose
  // It's called during application startup

  console.log('📊 Registering MongoDB models...');

  const models = [
    'Company',
    'User',
    'InventoryItem',
    'StockMovement',
    'ProductionOrder',
    'CustomerOrder',
    'Customer',
    'CustomerVisit',
    'Supplier',
    'FinancialTransaction',
    'AuditLog',
    'Role',
    'Visitor',
    'Vehicle',
    'SecurityLog',
    'Warehouse',
    'Invoice',
    'PurchaseOrder',
    'Quotation',
    'BusinessAnalytics',
    'BoilerMonitoring',
    'ElectricityMonitoring',
    'Hospitality',
    'Dispatch',
    'Report',
    'Spare'
  ];

  console.log(`✅ Registered ${models.length} models: ${models.join(', ')}`);

  return models;
};
