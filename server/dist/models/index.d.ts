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
export { Company, User, InventoryItem, StockMovement, ProductionOrder, CustomerOrder, Customer, CustomerVisit, Supplier, FinancialTransaction, AuditLog, Role, Visitor, Vehicle, SecurityLog, Warehouse, Invoice, PurchaseOrder, Quotation, BusinessAnalytics, BoilerMonitoring, ElectricityMonitoring, Hospitality, Dispatch, Report, Spare };
declare const _default: {
    Company: import("mongoose").Model<import("../types/models").ICompany, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").ICompany, {}> & import("../types/models").ICompany & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    User: import("mongoose").Model<import("../types/models").IUser, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IUser, {}> & import("../types/models").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    InventoryItem: import("mongoose").Model<import("../types/models").IInventoryItem, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IInventoryItem, {}> & import("../types/models").IInventoryItem & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    StockMovement: import("mongoose").Model<import("../types/models").IStockMovement, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IStockMovement, {}> & import("../types/models").IStockMovement & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    ProductionOrder: import("mongoose").Model<import("../types/models").IProductionOrder, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IProductionOrder, {}> & import("../types/models").IProductionOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    CustomerOrder: import("mongoose").Model<import("../types/models").ICustomerOrder, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").ICustomerOrder, {}> & import("../types/models").ICustomerOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Customer: import("mongoose").Model<import("../types/models").ICustomer, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").ICustomer, {}> & import("../types/models").ICustomer & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    CustomerVisit: import("mongoose").Model<import("./CustomerVisit").ICustomerVisit, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./CustomerVisit").ICustomerVisit, {}> & import("./CustomerVisit").ICustomerVisit & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, any>;
    Supplier: import("mongoose").Model<import("../types/models").ISupplier, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").ISupplier, {}> & import("../types/models").ISupplier & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    FinancialTransaction: import("mongoose").Model<import("../types/models").IFinancialTransaction, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IFinancialTransaction, {}> & import("../types/models").IFinancialTransaction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    AuditLog: import("mongoose").Model<import("../types/models").IAuditLog, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IAuditLog, {}> & import("../types/models").IAuditLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Role: import("mongoose").Model<import("../types/models").IRole, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IRole, {}> & import("../types/models").IRole & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Visitor: import("./Visitor").IVisitorModel;
    Vehicle: import("mongoose").Model<import("./Vehicle").ISimpleVehicle, {}, {}, {}, import("mongoose").Document<unknown, {}, import("./Vehicle").ISimpleVehicle, {}> & import("./Vehicle").ISimpleVehicle & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, any>;
    SecurityLog: import("mongoose").Model<import("../types/models").ISecurityLog, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").ISecurityLog, {}> & import("../types/models").ISecurityLog & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Warehouse: import("mongoose").Model<import("../types/models").IWarehouse, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IWarehouse, {}> & import("../types/models").IWarehouse & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Invoice: import("mongoose").Model<import("../types/models").IInvoice, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IInvoice, {}> & import("../types/models").IInvoice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    PurchaseOrder: import("mongoose").Model<import("../types/models").IPurchaseOrder, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IPurchaseOrder, {}> & import("../types/models").IPurchaseOrder & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Quotation: import("mongoose").Model<import("../types/models").IQuotation, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IQuotation, {}> & import("../types/models").IQuotation & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    BusinessAnalytics: import("mongoose").Model<import("../types/models").IBusinessAnalytics, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IBusinessAnalytics, {}> & import("../types/models").IBusinessAnalytics & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    BoilerMonitoring: import("mongoose").Model<import("../types/models").IBoilerMonitoring, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IBoilerMonitoring, {}> & import("../types/models").IBoilerMonitoring & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    ElectricityMonitoring: import("mongoose").Model<import("../types/models").IElectricityMonitoring, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IElectricityMonitoring, {}> & import("../types/models").IElectricityMonitoring & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Hospitality: import("mongoose").Model<import("../types/models").IHospitality, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IHospitality, {}> & import("../types/models").IHospitality & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Dispatch: import("mongoose").Model<import("../types/models").IDispatch, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IDispatch, {}> & import("../types/models").IDispatch & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Report: import("mongoose").Model<import("../types/models").IReport, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").IReport, {}> & import("../types/models").IReport & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
    Spare: import("mongoose").Model<import("../types/models").ISpare, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../types/models").ISpare, {}> & import("../types/models").ISpare & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, any>;
};
export default _default;
export declare const registerModels: () => string[];
//# sourceMappingURL=index.d.ts.map