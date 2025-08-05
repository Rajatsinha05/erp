import { Schema, model, Document } from 'mongoose';

// Simplified Customer Visit interface
export interface ICustomerVisit extends Document {
  partyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  visitDate: Date;
  purpose: string;
  purposeDescription: string;
  travelType: string;

  // Travel Details
  travelDetails: {
    origin: string;
    destination: string;
    travelMode: string;
    departureDate?: Date;
    returnDate?: Date;
    travelClass?: string;
  };

  // Food Expenses
  foodExpenses: Array<{
    date: Date;
    mealType: string;
    restaurant: string;
    location: string;
    numberOfPeople: number;
    costPerPerson: number;
    totalCost: number;
    description?: string;
    billNumber?: string;
  }>;

  // Gifts Given
  giftsGiven: Array<{
    itemName: string;
    itemType: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    description?: string;
    recipientName?: string;
  }>;

  // Transportation Expenses
  transportationExpenses: Array<{
    date: Date;
    type: string;
    from: string;
    to: string;
    cost: number;
    description?: string;
    billNumber?: string;
  }>;

  // Other Expenses
  otherExpenses: Array<{
    date: Date;
    category: string;
    description: string;
    cost: number;
    billNumber?: string;
  }>;

  // Visit Outcome
  visitOutcome: {
    status: string;
    notes: string;
    nextActionRequired?: string;
    nextFollowUpDate?: Date;
    businessGenerated?: number;
    potentialBusiness?: number;
  };

  // Financial Summary
  totalExpenses: {
    accommodation: number;
    food: number;
    transportation: number;
    gifts: number;
    other: number;
    total: number;
  };

  approvalStatus: string;
  companyId: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
}

const CustomerVisitSchema = new Schema<ICustomerVisit>({
  companyId: {
    type: Schema.Types.ObjectId,
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

  // Travel Details
  travelDetails: {
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    travelMode: { type: String, required: true },
    departureDate: { type: Date },
    returnDate: { type: Date },
    travelClass: { type: String }
  },

  // Food Expenses
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

  // Gifts Given
  giftsGiven: [{
    itemName: { type: String, required: true, trim: true },
    itemType: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    recipientName: { type: String, trim: true }
  }],

  // Transportation Expenses
  transportationExpenses: [{
    date: { type: Date, required: true },
    type: { type: String, required: true },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    billNumber: { type: String, trim: true }
  }],

  // Other Expenses
  otherExpenses: [{
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 },
    billNumber: { type: String, trim: true }
  }],

  // Visit Outcome
  visitOutcome: {
    status: { type: String, required: true },
    notes: { type: String, required: true, trim: true },
    nextActionRequired: { type: String, trim: true },
    nextFollowUpDate: { type: Date },
    businessGenerated: { type: Number, min: 0 },
    potentialBusiness: { type: Number, min: 0 }
  },

  // Financial Summary
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'customer_visits'
});

// Basic indexes
CustomerVisitSchema.index({ companyId: 1, visitDate: -1 });
CustomerVisitSchema.index({ companyId: 1, partyName: 1 });

export default model<ICustomerVisit>('CustomerVisit', CustomerVisitSchema);
