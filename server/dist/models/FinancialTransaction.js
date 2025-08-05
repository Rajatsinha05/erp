"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TaxBreakupSchema = new mongoose_1.Schema({
    taxType: { type: String, enum: ['CGST', 'SGST', 'IGST', 'CESS', 'TDS', 'TCS'], required: true },
    rate: { type: Number, required: true, min: 0, max: 100 },
    amount: { type: Number, required: true, min: 0 },
    taxableAmount: { type: Number, required: true, min: 0 }
}, { _id: false });
const BankDetailsSchema = new mongoose_1.Schema({
    bankName: { type: String },
    branchName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    transactionId: { type: String },
    utrNumber: { type: String },
    chequeNumber: { type: String },
    chequeDate: { type: Date },
    clearanceDate: { type: Date },
    clearanceStatus: { type: String, enum: ['pending', 'cleared', 'bounced', 'cancelled'] }
}, { _id: false });
const RecurringDetailsSchema = new mongoose_1.Schema({
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] },
    interval: { type: Number, default: 1, min: 1 },
    startDate: { type: Date },
    endDate: { type: Date },
    nextDueDate: { type: Date },
    totalOccurrences: { type: Number },
    completedOccurrences: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { _id: false });
const FinancialTransactionSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    transactionNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    transactionDate: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    financialYear: {
        type: String,
        required: true,
        index: true
    },
    transactionType: {
        type: String,
        enum: ['income', 'expense', 'transfer', 'adjustment', 'opening_balance', 'closing_balance'],
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: [
            'sales_revenue', 'service_income', 'interest_income', 'dividend_income', 'rental_income', 'other_income',
            'raw_material', 'salary_wages', 'rent', 'utilities', 'transport', 'marketing', 'professional_fees',
            'insurance', 'maintenance', 'depreciation', 'interest_expense', 'tax_expense', 'other_expense',
            'bank_transfer', 'cash_deposit', 'cash_withdrawal', 'loan_repayment', 'investment',
            'bank_charges', 'exchange_rate_diff', 'rounding_off', 'bad_debt', 'provision'
        ],
        required: true,
        index: true
    },
    subCategory: { type: String },
    amount: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                return v !== 0;
            },
            message: 'Amount cannot be zero'
        }
    },
    currency: { type: String, default: 'INR' },
    exchangeRate: { type: Number, default: 1, min: 0 },
    baseAmount: { type: Number },
    taxDetails: {
        isTaxable: { type: Boolean, default: false },
        taxIncluded: { type: Boolean, default: false },
        taxableAmount: { type: Number, default: 0, min: 0 },
        totalTaxAmount: { type: Number, default: 0, min: 0 },
        taxBreakup: [TaxBreakupSchema],
        hsnCode: { type: String },
        sacCode: { type: String },
        placeOfSupply: { type: String },
        reverseCharge: { type: Boolean, default: false }
    },
    paymentDetails: {
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'dd', 'online', 'adjustment'],
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
            default: 'completed',
            index: true
        },
        bankDetails: BankDetailsSchema,
        paymentReference: { type: String },
        paymentNotes: { type: String }
    },
    partyDetails: {
        partyType: { type: String, enum: ['customer', 'supplier', 'employee', 'bank', 'government', 'other'] },
        partyId: { type: mongoose_1.Schema.Types.ObjectId },
        partyName: { type: String },
        partyCode: { type: String },
        partyGSTIN: { type: String },
        partyPAN: { type: String }
    },
    accountDetails: {
        fromAccount: {
            accountType: { type: String, enum: ['bank', 'cash', 'petty_cash', 'credit_card'] },
            accountId: { type: mongoose_1.Schema.Types.ObjectId },
            accountName: { type: String },
            accountNumber: { type: String }
        },
        toAccount: {
            accountType: { type: String, enum: ['bank', 'cash', 'petty_cash', 'credit_card'] },
            accountId: { type: mongoose_1.Schema.Types.ObjectId },
            accountName: { type: String },
            accountNumber: { type: String }
        }
    },
    referenceDocuments: {
        invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
        invoiceNumber: { type: String },
        purchaseOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
        purchaseOrderNumber: { type: String },
        salesOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CustomerOrder' },
        salesOrderNumber: { type: String },
        billId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Bill' },
        billNumber: { type: String },
        otherReferences: [String]
    },
    recurringDetails: RecurringDetailsSchema,
    reconciliation: {
        isReconciled: { type: Boolean, default: false },
        reconciledDate: { type: Date },
        reconciledBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        bankStatementDate: { type: Date },
        bankStatementAmount: { type: Number },
        reconciliationNotes: { type: String },
        discrepancyAmount: { type: Number, default: 0 }
    },
    approval: {
        isRequired: { type: Boolean, default: false },
        requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date },
        approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: { type: Date },
        approvalLevel: { type: Number, default: 1 },
        approvalNotes: { type: String },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved'
        }
    },
    description: { type: String, required: true },
    internalNotes: { type: String },
    tags: [String],
    attachments: [String],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    isReversed: { type: Boolean, default: false },
    reversedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reversedAt: { type: Date },
    reversalReason: { type: String },
    originalTransactionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'FinancialTransaction' }
}, {
    timestamps: true,
    collection: 'financial_transactions'
});
FinancialTransactionSchema.index({ companyId: 1, transactionDate: -1 });
FinancialTransactionSchema.index({ companyId: 1, transactionType: 1, transactionDate: -1 });
FinancialTransactionSchema.index({ companyId: 1, category: 1, transactionDate: -1 });
FinancialTransactionSchema.index({ companyId: 1, financialYear: 1 });
FinancialTransactionSchema.index({ companyId: 1, 'paymentDetails.paymentStatus': 1 });
FinancialTransactionSchema.index({ companyId: 1, 'partyDetails.partyType': 1, 'partyDetails.partyId': 1 });
FinancialTransactionSchema.index({ 'referenceDocuments.invoiceId': 1 });
FinancialTransactionSchema.index({ 'referenceDocuments.salesOrderId': 1 });
FinancialTransactionSchema.index({ 'recurringDetails.isRecurring': 1, 'recurringDetails.nextDueDate': 1 });
FinancialTransactionSchema.index({ transactionNumber: 1 }, { unique: true });
FinancialTransactionSchema.index({
    transactionNumber: 'text',
    description: 'text',
    'partyDetails.partyName': 'text',
    'paymentDetails.paymentReference': 'text'
});
FinancialTransactionSchema.pre('save', function (next) {
    if (this.exchangeRate && this.exchangeRate !== 1) {
        this.baseAmount = this.amount * this.exchangeRate;
    }
    else {
        this.baseAmount = this.amount;
    }
    if (this.taxDetails.taxBreakup && this.taxDetails.taxBreakup.length > 0) {
        this.taxDetails.totalTaxAmount = this.taxDetails.taxBreakup.reduce((total, tax) => total + tax.amount, 0);
    }
    if (!this.financialYear) {
        const transactionYear = this.transactionDate.getFullYear();
        const transactionMonth = this.transactionDate.getMonth() + 1;
        if (transactionMonth >= 4) {
            this.financialYear = `${transactionYear}-${transactionYear + 1}`;
        }
        else {
            this.financialYear = `${transactionYear - 1}-${transactionYear}`;
        }
    }
    next();
});
FinancialTransactionSchema.methods.isIncome = function () {
    return this.transactionType === 'income' || this.amount > 0;
};
FinancialTransactionSchema.methods.isExpense = function () {
    return this.transactionType === 'expense' || this.amount < 0;
};
FinancialTransactionSchema.methods.isPending = function () {
    return this.paymentDetails.paymentStatus === 'pending';
};
FinancialTransactionSchema.methods.isReconciled = function () {
    return this.reconciliation.isReconciled;
};
FinancialTransactionSchema.methods.getTaxAmount = function () {
    return this.taxDetails.totalTaxAmount || 0;
};
FinancialTransactionSchema.methods.getNetAmount = function () {
    if (this.taxDetails.taxIncluded) {
        return Math.abs(this.amount);
    }
    else {
        return Math.abs(this.amount) + this.getTaxAmount();
    }
};
FinancialTransactionSchema.statics.findByCompany = function (companyId) {
    return this.find({ companyId }).sort({ transactionDate: -1 });
};
FinancialTransactionSchema.statics.findByDateRange = function (companyId, startDate, endDate) {
    return this.find({
        companyId,
        transactionDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ transactionDate: -1 });
};
FinancialTransactionSchema.statics.findByType = function (companyId, transactionType) {
    return this.find({ companyId, transactionType }).sort({ transactionDate: -1 });
};
FinancialTransactionSchema.statics.findPendingReconciliation = function (companyId) {
    return this.find({
        companyId,
        'reconciliation.isReconciled': false,
        'paymentDetails.paymentMethod': { $in: ['bank_transfer', 'cheque', 'dd'] }
    }).sort({ transactionDate: 1 });
};
FinancialTransactionSchema.statics.getFinancialSummary = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                transactionDate: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$transactionType',
                totalAmount: { $sum: '$baseAmount' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$baseAmount' }
            }
        }
    ]);
};
FinancialTransactionSchema.statics.getCashFlow = function (companyId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                companyId: new mongoose_1.Schema.Types.ObjectId(companyId),
                transactionDate: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$transactionDate' },
                    month: { $month: '$transactionDate' },
                    type: '$transactionType'
                },
                totalAmount: { $sum: '$baseAmount' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);
};
exports.default = (0, mongoose_1.model)('FinancialTransaction', FinancialTransactionSchema);
//# sourceMappingURL=FinancialTransaction.js.map