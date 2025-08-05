"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModels = exports.Spare = exports.Report = exports.Dispatch = exports.Hospitality = exports.ElectricityMonitoring = exports.BoilerMonitoring = exports.BusinessAnalytics = exports.Quotation = exports.PurchaseOrder = exports.Invoice = exports.Warehouse = exports.SecurityLog = exports.Vehicle = exports.Visitor = exports.Role = exports.AuditLog = exports.FinancialTransaction = exports.Supplier = exports.CustomerVisit = exports.Customer = exports.CustomerOrder = exports.ProductionOrder = exports.StockMovement = exports.InventoryItem = exports.User = exports.Company = void 0;
const Company_1 = __importDefault(require("./Company"));
exports.Company = Company_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const InventoryItem_1 = __importDefault(require("./InventoryItem"));
exports.InventoryItem = InventoryItem_1.default;
const StockMovement_1 = __importDefault(require("./StockMovement"));
exports.StockMovement = StockMovement_1.default;
const ProductionOrder_1 = __importDefault(require("./ProductionOrder"));
exports.ProductionOrder = ProductionOrder_1.default;
const CustomerOrder_1 = __importDefault(require("./CustomerOrder"));
exports.CustomerOrder = CustomerOrder_1.default;
const Customer_1 = __importDefault(require("./Customer"));
exports.Customer = Customer_1.default;
const CustomerVisit_1 = __importDefault(require("./CustomerVisit"));
exports.CustomerVisit = CustomerVisit_1.default;
const Supplier_1 = __importDefault(require("./Supplier"));
exports.Supplier = Supplier_1.default;
const FinancialTransaction_1 = __importDefault(require("./FinancialTransaction"));
exports.FinancialTransaction = FinancialTransaction_1.default;
const AuditLog_1 = __importDefault(require("./AuditLog"));
exports.AuditLog = AuditLog_1.default;
const Role_1 = __importDefault(require("./Role"));
exports.Role = Role_1.default;
const Visitor_1 = __importDefault(require("./Visitor"));
exports.Visitor = Visitor_1.default;
const Vehicle_1 = __importDefault(require("./Vehicle"));
exports.Vehicle = Vehicle_1.default;
const SecurityLog_1 = __importDefault(require("./SecurityLog"));
exports.SecurityLog = SecurityLog_1.default;
const Warehouse_1 = __importDefault(require("./Warehouse"));
exports.Warehouse = Warehouse_1.default;
const Invoice_1 = __importDefault(require("./Invoice"));
exports.Invoice = Invoice_1.default;
const PurchaseOrder_1 = __importDefault(require("./PurchaseOrder"));
exports.PurchaseOrder = PurchaseOrder_1.default;
const Quotation_1 = __importDefault(require("./Quotation"));
exports.Quotation = Quotation_1.default;
const BusinessAnalytics_1 = __importDefault(require("./BusinessAnalytics"));
exports.BusinessAnalytics = BusinessAnalytics_1.default;
const BoilerMonitoring_1 = __importDefault(require("./BoilerMonitoring"));
exports.BoilerMonitoring = BoilerMonitoring_1.default;
const ElectricityMonitoring_1 = __importDefault(require("./ElectricityMonitoring"));
exports.ElectricityMonitoring = ElectricityMonitoring_1.default;
const Hospitality_1 = __importDefault(require("./Hospitality"));
exports.Hospitality = Hospitality_1.default;
const Dispatch_1 = __importDefault(require("./Dispatch"));
exports.Dispatch = Dispatch_1.default;
const Report_1 = __importDefault(require("./Report"));
exports.Report = Report_1.default;
const Spare_1 = __importDefault(require("./Spare"));
exports.Spare = Spare_1.default;
exports.default = {
    Company: Company_1.default,
    User: User_1.default,
    InventoryItem: InventoryItem_1.default,
    StockMovement: StockMovement_1.default,
    ProductionOrder: ProductionOrder_1.default,
    CustomerOrder: CustomerOrder_1.default,
    Customer: Customer_1.default,
    CustomerVisit: CustomerVisit_1.default,
    Supplier: Supplier_1.default,
    FinancialTransaction: FinancialTransaction_1.default,
    AuditLog: AuditLog_1.default,
    Role: Role_1.default,
    Visitor: Visitor_1.default,
    Vehicle: Vehicle_1.default,
    SecurityLog: SecurityLog_1.default,
    Warehouse: Warehouse_1.default,
    Invoice: Invoice_1.default,
    PurchaseOrder: PurchaseOrder_1.default,
    Quotation: Quotation_1.default,
    BusinessAnalytics: BusinessAnalytics_1.default,
    BoilerMonitoring: BoilerMonitoring_1.default,
    ElectricityMonitoring: ElectricityMonitoring_1.default,
    Hospitality: Hospitality_1.default,
    Dispatch: Dispatch_1.default,
    Report: Report_1.default,
    Spare: Spare_1.default
};
const registerModels = () => {
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
exports.registerModels = registerModels;
//# sourceMappingURL=index.js.map