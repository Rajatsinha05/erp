"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CustomerVisitSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    partyName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    contactPhone: {
        type: String,
        required: true,
        trim: true
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    visitDate: {
        type: Date,
        required: true,
        index: true
    },
    purpose: {
        type: String,
        required: true,
        index: true
    },
    purposeDescription: {
        type: String,
        required: true,
        trim: true
    },
    travelType: {
        type: String,
        required: true,
        index: true
    },
    travelDetails: {
        origin: { type: String, required: true, trim: true },
        destination: { type: String, required: true, trim: true },
        travelMode: { type: String, required: true },
        departureDate: { type: Date },
        returnDate: { type: Date },
        travelClass: { type: String }
    },
    foodExpenses: [{
            date: { type: Date, required: true },
            mealType: { type: String, required: true },
            restaurant: { type: String, required: true, trim: true },
            location: { type: String, required: true, trim: true },
            numberOfPeople: { type: Number, required: true, min: 1 },
            costPerPerson: { type: Number, required: true, min: 0 },
            totalCost: { type: Number, required: true, min: 0 },
            description: { type: String, trim: true },
            billNumber: { type: String, trim: true }
        }],
    giftsGiven: [{
            itemName: { type: String, required: true, trim: true },
            itemType: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            unitCost: { type: Number, required: true, min: 0 },
            totalCost: { type: Number, required: true, min: 0 },
            description: { type: String, trim: true },
            recipientName: { type: String, trim: true }
        }],
    transportationExpenses: [{
            date: { type: Date, required: true },
            type: { type: String, required: true },
            from: { type: String, required: true, trim: true },
            to: { type: String, required: true, trim: true },
            cost: { type: Number, required: true, min: 0 },
            description: { type: String, trim: true },
            billNumber: { type: String, trim: true }
        }],
    otherExpenses: [{
            date: { type: Date, required: true },
            category: { type: String, required: true },
            description: { type: String, required: true, trim: true },
            cost: { type: Number, required: true, min: 0 },
            billNumber: { type: String, trim: true }
        }],
    visitOutcome: {
        status: { type: String, required: true },
        notes: { type: String, required: true, trim: true },
        nextActionRequired: { type: String, trim: true },
        nextFollowUpDate: { type: Date },
        businessGenerated: { type: Number, min: 0 },
        potentialBusiness: { type: Number, min: 0 }
    },
    totalExpenses: {
        accommodation: { type: Number, default: 0, min: 0 },
        food: { type: Number, default: 0, min: 0 },
        transportation: { type: Number, default: 0, min: 0 },
        gifts: { type: Number, default: 0, min: 0 },
        other: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 }
    },
    approvalStatus: {
        type: String,
        default: 'pending',
        index: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    collection: 'customer_visits'
});
CustomerVisitSchema.index({ companyId: 1, visitDate: -1 });
CustomerVisitSchema.index({ companyId: 1, partyName: 1 });
exports.default = (0, mongoose_1.model)('CustomerVisit', CustomerVisitSchema);
//# sourceMappingURL=CustomerVisit.js.map