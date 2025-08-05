"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerFactory = exports.SpareController = exports.ReportController = exports.DispatchController = exports.HospitalityController = exports.ElectricityMonitoringController = exports.BoilerMonitoringController = exports.BusinessAnalyticsController = exports.SecurityLogController = exports.AuditLogController = exports.FinancialTransactionController = exports.StockMovementController = exports.WarehouseController = exports.VehicleController = exports.RoleController = exports.QuotationController = exports.PurchaseOrderController = exports.InvoiceController = exports.CustomerOrderController = exports.ProductionController = exports.InventoryController = exports.SupplierController = exports.CustomerController = exports.VisitorController = exports.UserController = exports.CompanyController = exports.BaseController = void 0;
var BaseController_1 = require("./BaseController");
Object.defineProperty(exports, "BaseController", { enumerable: true, get: function () { return BaseController_1.BaseController; } });
var CompanyController_1 = require("./CompanyController");
Object.defineProperty(exports, "CompanyController", { enumerable: true, get: function () { return CompanyController_1.CompanyController; } });
var UserController_1 = require("./UserController");
Object.defineProperty(exports, "UserController", { enumerable: true, get: function () { return UserController_1.UserController; } });
var VisitorController_1 = require("./VisitorController");
Object.defineProperty(exports, "VisitorController", { enumerable: true, get: function () { return VisitorController_1.VisitorController; } });
var CustomerController_1 = require("./CustomerController");
Object.defineProperty(exports, "CustomerController", { enumerable: true, get: function () { return CustomerController_1.CustomerController; } });
var SupplierController_1 = require("./SupplierController");
Object.defineProperty(exports, "SupplierController", { enumerable: true, get: function () { return SupplierController_1.SupplierController; } });
var InventoryController_1 = require("./InventoryController");
Object.defineProperty(exports, "InventoryController", { enumerable: true, get: function () { return InventoryController_1.InventoryController; } });
var ProductionController_1 = require("./ProductionController");
Object.defineProperty(exports, "ProductionController", { enumerable: true, get: function () { return ProductionController_1.ProductionController; } });
var CustomerOrderController_1 = require("./CustomerOrderController");
Object.defineProperty(exports, "CustomerOrderController", { enumerable: true, get: function () { return CustomerOrderController_1.CustomerOrderController; } });
var InvoiceController_1 = require("./InvoiceController");
Object.defineProperty(exports, "InvoiceController", { enumerable: true, get: function () { return InvoiceController_1.InvoiceController; } });
var PurchaseOrderController_1 = require("./PurchaseOrderController");
Object.defineProperty(exports, "PurchaseOrderController", { enumerable: true, get: function () { return PurchaseOrderController_1.PurchaseOrderController; } });
var QuotationController_1 = require("./QuotationController");
Object.defineProperty(exports, "QuotationController", { enumerable: true, get: function () { return QuotationController_1.QuotationController; } });
var RoleController_1 = require("./RoleController");
Object.defineProperty(exports, "RoleController", { enumerable: true, get: function () { return RoleController_1.RoleController; } });
var VehicleController_1 = require("./VehicleController");
Object.defineProperty(exports, "VehicleController", { enumerable: true, get: function () { return VehicleController_1.VehicleController; } });
var WarehouseController_1 = require("./WarehouseController");
Object.defineProperty(exports, "WarehouseController", { enumerable: true, get: function () { return WarehouseController_1.WarehouseController; } });
var StockMovementController_1 = require("./StockMovementController");
Object.defineProperty(exports, "StockMovementController", { enumerable: true, get: function () { return StockMovementController_1.StockMovementController; } });
var FinancialTransactionController_1 = require("./FinancialTransactionController");
Object.defineProperty(exports, "FinancialTransactionController", { enumerable: true, get: function () { return FinancialTransactionController_1.FinancialTransactionController; } });
var AuditLogController_1 = require("./AuditLogController");
Object.defineProperty(exports, "AuditLogController", { enumerable: true, get: function () { return AuditLogController_1.AuditLogController; } });
var SecurityLogController_1 = require("./SecurityLogController");
Object.defineProperty(exports, "SecurityLogController", { enumerable: true, get: function () { return SecurityLogController_1.SecurityLogController; } });
var BusinessAnalyticsController_1 = require("./BusinessAnalyticsController");
Object.defineProperty(exports, "BusinessAnalyticsController", { enumerable: true, get: function () { return BusinessAnalyticsController_1.BusinessAnalyticsController; } });
var BoilerMonitoringController_1 = require("./BoilerMonitoringController");
Object.defineProperty(exports, "BoilerMonitoringController", { enumerable: true, get: function () { return BoilerMonitoringController_1.BoilerMonitoringController; } });
var ElectricityMonitoringController_1 = require("./ElectricityMonitoringController");
Object.defineProperty(exports, "ElectricityMonitoringController", { enumerable: true, get: function () { return ElectricityMonitoringController_1.ElectricityMonitoringController; } });
var HospitalityController_1 = require("./HospitalityController");
Object.defineProperty(exports, "HospitalityController", { enumerable: true, get: function () { return HospitalityController_1.HospitalityController; } });
var DispatchController_1 = require("./DispatchController");
Object.defineProperty(exports, "DispatchController", { enumerable: true, get: function () { return DispatchController_1.DispatchController; } });
var ReportController_1 = require("./ReportController");
Object.defineProperty(exports, "ReportController", { enumerable: true, get: function () { return ReportController_1.ReportController; } });
var SpareController_1 = require("./SpareController");
Object.defineProperty(exports, "SpareController", { enumerable: true, get: function () { return SpareController_1.SpareController; } });
const CompanyController_2 = require("./CompanyController");
const UserController_2 = require("./UserController");
const VisitorController_2 = require("./VisitorController");
const CustomerController_2 = require("./CustomerController");
const SupplierController_2 = require("./SupplierController");
const InventoryController_2 = require("./InventoryController");
const ProductionController_2 = require("./ProductionController");
const CustomerOrderController_2 = require("./CustomerOrderController");
const InvoiceController_2 = require("./InvoiceController");
const PurchaseOrderController_2 = require("./PurchaseOrderController");
const QuotationController_2 = require("./QuotationController");
const RoleController_2 = require("./RoleController");
const VehicleController_2 = require("./VehicleController");
const WarehouseController_2 = require("./WarehouseController");
const StockMovementController_2 = require("./StockMovementController");
const FinancialTransactionController_2 = require("./FinancialTransactionController");
const AuditLogController_2 = require("./AuditLogController");
const SecurityLogController_2 = require("./SecurityLogController");
const BusinessAnalyticsController_2 = require("./BusinessAnalyticsController");
const BoilerMonitoringController_2 = require("./BoilerMonitoringController");
const ElectricityMonitoringController_2 = require("./ElectricityMonitoringController");
const HospitalityController_2 = require("./HospitalityController");
const DispatchController_2 = require("./DispatchController");
const ReportController_2 = require("./ReportController");
class ControllerFactory {
    static instances = new Map();
    static getController(ControllerClass) {
        const controllerName = ControllerClass.name;
        if (!this.instances.has(controllerName)) {
            this.instances.set(controllerName, new ControllerClass());
        }
        return this.instances.get(controllerName);
    }
    static getCompanyController() {
        return this.getController(CompanyController_2.CompanyController);
    }
    static getUserController() {
        return this.getController(UserController_2.UserController);
    }
    static getVisitorController() {
        return this.getController(VisitorController_2.VisitorController);
    }
    static getCustomerController() {
        return this.getController(CustomerController_2.CustomerController);
    }
    static getSupplierController() {
        return this.getController(SupplierController_2.SupplierController);
    }
    static getInventoryController() {
        return this.getController(InventoryController_2.InventoryController);
    }
    static getProductionController() {
        return this.getController(ProductionController_2.ProductionController);
    }
    static getCustomerOrderController() {
        return this.getController(CustomerOrderController_2.CustomerOrderController);
    }
    static getInvoiceController() {
        return this.getController(InvoiceController_2.InvoiceController);
    }
    static getPurchaseOrderController() {
        return this.getController(PurchaseOrderController_2.PurchaseOrderController);
    }
    static getQuotationController() {
        return this.getController(QuotationController_2.QuotationController);
    }
    static getRoleController() {
        return this.getController(RoleController_2.RoleController);
    }
    static getVehicleController() {
        return this.getController(VehicleController_2.VehicleController);
    }
    static getWarehouseController() {
        return this.getController(WarehouseController_2.WarehouseController);
    }
    static getStockMovementController() {
        return this.getController(StockMovementController_2.StockMovementController);
    }
    static getFinancialTransactionController() {
        return this.getController(FinancialTransactionController_2.FinancialTransactionController);
    }
    static getAuditLogController() {
        return this.getController(AuditLogController_2.AuditLogController);
    }
    static getSecurityLogController() {
        return this.getController(SecurityLogController_2.SecurityLogController);
    }
    static getBusinessAnalyticsController() {
        return this.getController(BusinessAnalyticsController_2.BusinessAnalyticsController);
    }
    static getBoilerMonitoringController() {
        return this.getController(BoilerMonitoringController_2.BoilerMonitoringController);
    }
    static getElectricityMonitoringController() {
        return this.getController(ElectricityMonitoringController_2.ElectricityMonitoringController);
    }
    static getHospitalityController() {
        return this.getController(HospitalityController_2.HospitalityController);
    }
    static getDispatchController() {
        return this.getController(DispatchController_2.DispatchController);
    }
    static getReportController() {
        return this.getController(ReportController_2.ReportController);
    }
    static clearInstances() {
        this.instances.clear();
    }
}
exports.ControllerFactory = ControllerFactory;
exports.default = {
    CompanyController: CompanyController_2.CompanyController,
    UserController: UserController_2.UserController,
    VisitorController: VisitorController_2.VisitorController,
    CustomerController: CustomerController_2.CustomerController,
    SupplierController: SupplierController_2.SupplierController,
    InventoryController: InventoryController_2.InventoryController,
    ProductionController: ProductionController_2.ProductionController,
    CustomerOrderController: CustomerOrderController_2.CustomerOrderController,
    InvoiceController: InvoiceController_2.InvoiceController,
    PurchaseOrderController: PurchaseOrderController_2.PurchaseOrderController,
    QuotationController: QuotationController_2.QuotationController,
    RoleController: RoleController_2.RoleController,
    VehicleController: VehicleController_2.VehicleController,
    WarehouseController: WarehouseController_2.WarehouseController,
    StockMovementController: StockMovementController_2.StockMovementController,
    FinancialTransactionController: FinancialTransactionController_2.FinancialTransactionController,
    AuditLogController: AuditLogController_2.AuditLogController,
    SecurityLogController: SecurityLogController_2.SecurityLogController,
    BusinessAnalyticsController: BusinessAnalyticsController_2.BusinessAnalyticsController,
    BoilerMonitoringController: BoilerMonitoringController_2.BoilerMonitoringController,
    ElectricityMonitoringController: ElectricityMonitoringController_2.ElectricityMonitoringController,
    HospitalityController: HospitalityController_2.HospitalityController,
    DispatchController: DispatchController_2.DispatchController,
    ReportController: ReportController_2.ReportController,
    ControllerFactory
};
//# sourceMappingURL=index.js.map