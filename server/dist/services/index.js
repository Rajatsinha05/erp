"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceFactory = exports.SpareService = exports.ReportService = exports.DispatchService = exports.HospitalityService = exports.ElectricityMonitoringService = exports.BoilerMonitoringService = exports.BusinessAnalyticsService = exports.SecurityLogService = exports.AuditLogService = exports.FinancialTransactionService = exports.RoleService = exports.VehicleService = exports.WarehouseService = exports.QuotationService = exports.InvoiceService = exports.PurchaseOrderService = exports.CustomerOrderService = exports.ProductionService = exports.StockMovementService = exports.InventoryService = exports.SupplierService = exports.CustomerService = exports.VisitorService = exports.UserService = exports.CompanyService = exports.BaseService = void 0;
var BaseService_1 = require("./BaseService");
Object.defineProperty(exports, "BaseService", { enumerable: true, get: function () { return BaseService_1.BaseService; } });
var CompanyService_1 = require("./CompanyService");
Object.defineProperty(exports, "CompanyService", { enumerable: true, get: function () { return CompanyService_1.CompanyService; } });
var UserService_1 = require("./UserService");
Object.defineProperty(exports, "UserService", { enumerable: true, get: function () { return UserService_1.UserService; } });
var VisitorService_1 = require("./VisitorService");
Object.defineProperty(exports, "VisitorService", { enumerable: true, get: function () { return VisitorService_1.VisitorService; } });
var CustomerService_1 = require("./CustomerService");
Object.defineProperty(exports, "CustomerService", { enumerable: true, get: function () { return CustomerService_1.CustomerService; } });
var SupplierService_1 = require("./SupplierService");
Object.defineProperty(exports, "SupplierService", { enumerable: true, get: function () { return SupplierService_1.SupplierService; } });
var InventoryService_1 = require("./InventoryService");
Object.defineProperty(exports, "InventoryService", { enumerable: true, get: function () { return InventoryService_1.InventoryService; } });
var StockMovementService_1 = require("./StockMovementService");
Object.defineProperty(exports, "StockMovementService", { enumerable: true, get: function () { return StockMovementService_1.StockMovementService; } });
var ProductionService_1 = require("./ProductionService");
Object.defineProperty(exports, "ProductionService", { enumerable: true, get: function () { return ProductionService_1.ProductionService; } });
var CustomerOrderService_1 = require("./CustomerOrderService");
Object.defineProperty(exports, "CustomerOrderService", { enumerable: true, get: function () { return CustomerOrderService_1.CustomerOrderService; } });
var PurchaseOrderService_1 = require("./PurchaseOrderService");
Object.defineProperty(exports, "PurchaseOrderService", { enumerable: true, get: function () { return PurchaseOrderService_1.PurchaseOrderService; } });
var InvoiceService_1 = require("./InvoiceService");
Object.defineProperty(exports, "InvoiceService", { enumerable: true, get: function () { return InvoiceService_1.InvoiceService; } });
var QuotationService_1 = require("./QuotationService");
Object.defineProperty(exports, "QuotationService", { enumerable: true, get: function () { return QuotationService_1.QuotationService; } });
var WarehouseService_1 = require("./WarehouseService");
Object.defineProperty(exports, "WarehouseService", { enumerable: true, get: function () { return WarehouseService_1.WarehouseService; } });
var VehicleService_1 = require("./VehicleService");
Object.defineProperty(exports, "VehicleService", { enumerable: true, get: function () { return VehicleService_1.VehicleService; } });
var RoleService_1 = require("./RoleService");
Object.defineProperty(exports, "RoleService", { enumerable: true, get: function () { return RoleService_1.RoleService; } });
var FinancialTransactionService_1 = require("./FinancialTransactionService");
Object.defineProperty(exports, "FinancialTransactionService", { enumerable: true, get: function () { return FinancialTransactionService_1.FinancialTransactionService; } });
var AuditLogService_1 = require("./AuditLogService");
Object.defineProperty(exports, "AuditLogService", { enumerable: true, get: function () { return AuditLogService_1.AuditLogService; } });
var SecurityLogService_1 = require("./SecurityLogService");
Object.defineProperty(exports, "SecurityLogService", { enumerable: true, get: function () { return SecurityLogService_1.SecurityLogService; } });
var BusinessAnalyticsService_1 = require("./BusinessAnalyticsService");
Object.defineProperty(exports, "BusinessAnalyticsService", { enumerable: true, get: function () { return BusinessAnalyticsService_1.BusinessAnalyticsService; } });
var BoilerMonitoringService_1 = require("./BoilerMonitoringService");
Object.defineProperty(exports, "BoilerMonitoringService", { enumerable: true, get: function () { return BoilerMonitoringService_1.BoilerMonitoringService; } });
var ElectricityMonitoringService_1 = require("./ElectricityMonitoringService");
Object.defineProperty(exports, "ElectricityMonitoringService", { enumerable: true, get: function () { return ElectricityMonitoringService_1.ElectricityMonitoringService; } });
var HospitalityService_1 = require("./HospitalityService");
Object.defineProperty(exports, "HospitalityService", { enumerable: true, get: function () { return HospitalityService_1.HospitalityService; } });
var DispatchService_1 = require("./DispatchService");
Object.defineProperty(exports, "DispatchService", { enumerable: true, get: function () { return DispatchService_1.DispatchService; } });
var ReportService_1 = require("./ReportService");
Object.defineProperty(exports, "ReportService", { enumerable: true, get: function () { return ReportService_1.ReportService; } });
var SpareService_1 = require("./SpareService");
Object.defineProperty(exports, "SpareService", { enumerable: true, get: function () { return SpareService_1.SpareService; } });
const CompanyService_2 = require("./CompanyService");
const UserService_2 = require("./UserService");
const VisitorService_2 = require("./VisitorService");
const CustomerService_2 = require("./CustomerService");
const SupplierService_2 = require("./SupplierService");
const InventoryService_2 = require("./InventoryService");
const StockMovementService_2 = require("./StockMovementService");
const ProductionService_2 = require("./ProductionService");
const CustomerOrderService_2 = require("./CustomerOrderService");
const PurchaseOrderService_2 = require("./PurchaseOrderService");
const InvoiceService_2 = require("./InvoiceService");
const QuotationService_2 = require("./QuotationService");
const WarehouseService_2 = require("./WarehouseService");
const VehicleService_2 = require("./VehicleService");
const RoleService_2 = require("./RoleService");
const FinancialTransactionService_2 = require("./FinancialTransactionService");
const AuditLogService_2 = require("./AuditLogService");
const SecurityLogService_2 = require("./SecurityLogService");
const BusinessAnalyticsService_2 = require("./BusinessAnalyticsService");
const BoilerMonitoringService_2 = require("./BoilerMonitoringService");
const ElectricityMonitoringService_2 = require("./ElectricityMonitoringService");
const HospitalityService_2 = require("./HospitalityService");
const DispatchService_2 = require("./DispatchService");
const ReportService_2 = require("./ReportService");
class ServiceFactory {
    static instances = new Map();
    static getService(ServiceClass) {
        const serviceName = ServiceClass.name;
        if (!this.instances.has(serviceName)) {
            this.instances.set(serviceName, new ServiceClass());
        }
        return this.instances.get(serviceName);
    }
    static getCompanyService() {
        return this.getService(CompanyService_2.CompanyService);
    }
    static getUserService() {
        return this.getService(UserService_2.UserService);
    }
    static getVisitorService() {
        return this.getService(VisitorService_2.VisitorService);
    }
    static getCustomerService() {
        return this.getService(CustomerService_2.CustomerService);
    }
    static getSupplierService() {
        return this.getService(SupplierService_2.SupplierService);
    }
    static getInventoryService() {
        return this.getService(InventoryService_2.InventoryService);
    }
    static getStockMovementService() {
        return this.getService(StockMovementService_2.StockMovementService);
    }
    static getProductionService() {
        return this.getService(ProductionService_2.ProductionService);
    }
    static getCustomerOrderService() {
        return this.getService(CustomerOrderService_2.CustomerOrderService);
    }
    static getPurchaseOrderService() {
        return this.getService(PurchaseOrderService_2.PurchaseOrderService);
    }
    static getInvoiceService() {
        return this.getService(InvoiceService_2.InvoiceService);
    }
    static getQuotationService() {
        return this.getService(QuotationService_2.QuotationService);
    }
    static getWarehouseService() {
        return this.getService(WarehouseService_2.WarehouseService);
    }
    static getVehicleService() {
        return this.getService(VehicleService_2.VehicleService);
    }
    static getRoleService() {
        return this.getService(RoleService_2.RoleService);
    }
    static getFinancialTransactionService() {
        return this.getService(FinancialTransactionService_2.FinancialTransactionService);
    }
    static getAuditLogService() {
        return this.getService(AuditLogService_2.AuditLogService);
    }
    static getSecurityLogService() {
        return this.getService(SecurityLogService_2.SecurityLogService);
    }
    static getBusinessAnalyticsService() {
        return this.getService(BusinessAnalyticsService_2.BusinessAnalyticsService);
    }
    static getBoilerMonitoringService() {
        return this.getService(BoilerMonitoringService_2.BoilerMonitoringService);
    }
    static getElectricityMonitoringService() {
        return this.getService(ElectricityMonitoringService_2.ElectricityMonitoringService);
    }
    static getHospitalityService() {
        return this.getService(HospitalityService_2.HospitalityService);
    }
    static getDispatchService() {
        return this.getService(DispatchService_2.DispatchService);
    }
    static getReportService() {
        return this.getService(ReportService_2.ReportService);
    }
    static clearInstances() {
        this.instances.clear();
    }
}
exports.ServiceFactory = ServiceFactory;
exports.default = {
    CompanyService: CompanyService_2.CompanyService,
    UserService: UserService_2.UserService,
    VisitorService: VisitorService_2.VisitorService,
    CustomerService: CustomerService_2.CustomerService,
    SupplierService: SupplierService_2.SupplierService,
    InventoryService: InventoryService_2.InventoryService,
    StockMovementService: StockMovementService_2.StockMovementService,
    ProductionService: ProductionService_2.ProductionService,
    CustomerOrderService: CustomerOrderService_2.CustomerOrderService,
    PurchaseOrderService: PurchaseOrderService_2.PurchaseOrderService,
    InvoiceService: InvoiceService_2.InvoiceService,
    QuotationService: QuotationService_2.QuotationService,
    WarehouseService: WarehouseService_2.WarehouseService,
    VehicleService: VehicleService_2.VehicleService,
    RoleService: RoleService_2.RoleService,
    FinancialTransactionService: FinancialTransactionService_2.FinancialTransactionService,
    AuditLogService: AuditLogService_2.AuditLogService,
    SecurityLogService: SecurityLogService_2.SecurityLogService,
    BusinessAnalyticsService: BusinessAnalyticsService_2.BusinessAnalyticsService,
    BoilerMonitoringService: BoilerMonitoringService_2.BoilerMonitoringService,
    ElectricityMonitoringService: ElectricityMonitoringService_2.ElectricityMonitoringService,
    HospitalityService: HospitalityService_2.HospitalityService,
    DispatchService: DispatchService_2.DispatchService,
    ReportService: ReportService_2.ReportService,
    ServiceFactory
};
//# sourceMappingURL=index.js.map