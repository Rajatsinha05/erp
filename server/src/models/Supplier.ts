import { Schema, model } from 'mongoose';
import { ISupplier } from '@/types/models';

const SupplierAddressSchema = new Schema({
  type: { type: String, enum: ['office', 'factory', 'warehouse', 'billing'], required: true },
  isPrimary: { type: Boolean, default: false },
  contactPerson: { type: String },
  phone: { type: String },
  email: { type: String },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  landmark: { type: String },
  gpsCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const SupplierContactSchema = new Schema({
  name: { type: String, required: true },
  designation: { type: String },
  department: { type: String },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  email: { type: String },
  whatsapp: { type: String },
  isPrimary: { type: Boolean, default: false },
  canReceiveOrders: { type: Boolean, default: false },
  canQuoteRates: { type: Boolean, default: false },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const ProductCategorySchema = new Schema({
  category: { type: String, required: true },
  subCategory: { type: String },
  products: [String],
  minimumOrderQuantity: { type: Number, min: 0 },
  leadTime: { type: Number, min: 0 }, // in days
  qualityGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C'] },
  certifications: [String],
  isActive: { type: Boolean, default: true }
}, { _id: false });

const PerformanceMetricSchema = new Schema({
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String },
  period: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const SupplierSchema = new Schema<ISupplier>({
  companyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true, 
    index: true 
  },

  // Supplier Identification
  supplierCode: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  supplierName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 255
  },
  legalName: { 
    type: String,
    trim: true,
    maxlength: 255
  },
  displayName: { 
    type: String,
    trim: true,
    maxlength: 255
  },

  // Business Information
  businessInfo: {
    businessType: { 
      type: String, 
      enum: ['individual', 'proprietorship', 'partnership', 'private_limited', 'public_limited', 'llp', 'trust', 'society', 'government'], 
      required: true 
    },
    industry: { type: String },
    subIndustry: { type: String },
    businessDescription: { type: String },
    website: { type: String },
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
      twitter: { type: String }
    },
    establishedYear: { type: Number },
    employeeCount: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
    annualTurnover: { type: String, enum: ['<1L', '1L-10L', '10L-1Cr', '1Cr-10Cr', '10Cr+'] },
    manufacturingCapacity: { type: String }
  },

  // Registration Details
  registrationDetails: {
    gstin: { 
      type: String,
      uppercase: true,
      match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      sparse: true
    },
    pan: { 
      type: String,
      uppercase: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    },
    cin: { type: String },
    udyogAadhar: { type: String },
    iecCode: { type: String },
    registrationNumber: { type: String },
    vatNumber: { type: String },
    cstNumber: { type: String },
    msmeNumber: { type: String },
    factoryLicense: { type: String }
  },

  // Contact Information
  contactInfo: {
    primaryPhone: { type: String, required: true },
    alternatePhone: { type: String },
    primaryEmail: { type: String, required: true },
    alternateEmail: { type: String },
    whatsapp: { type: String },
    fax: { type: String },
    tollFree: { type: String }
  },

  // Addresses
  addresses: [SupplierAddressSchema],

  // Contact Persons
  contactPersons: [SupplierContactSchema],

  // Product Categories & Capabilities
  productCategories: [ProductCategorySchema],

  // Financial Information
  financialInfo: {
    paymentTerms: { type: String },
    creditDays: { type: Number, default: 0, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    advancePaid: { type: Number, default: 0, min: 0 },
    outstandingPayable: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0, min: 0 },
    lastPaymentDate: { type: Date },
    lastPaymentAmount: { type: Number, min: 0 },
    preferredPaymentMethod: { 
      type: String, 
      enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'card'] 
    },
    currency: { type: String, default: 'INR' },
    taxDeductionRate: { type: Number, default: 0, min: 0, max: 100 }
  },

  // Banking Details
  bankingDetails: {
    bankName: { type: String },
    branchName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String },
    accountType: { type: String, enum: ['savings', 'current', 'cc', 'od'] },
    upiId: { type: String },
    isVerified: { type: Boolean, default: false }
  },

  // Supply History & Performance
  supplyHistory: {
    firstOrderDate: { type: Date },
    lastOrderDate: { type: Date },
    totalOrders: { type: Number, default: 0, min: 0 },
    totalOrderValue: { type: Number, default: 0, min: 0 },
    averageOrderValue: { type: Number, default: 0, min: 0 },
    onTimeDeliveryRate: { type: Number, default: 0, min: 0, max: 100 },
    qualityRejectionRate: { type: Number, default: 0, min: 0, max: 100 },
    averageLeadTime: { type: Number, default: 0, min: 0 }, // in days
    suppliedProducts: [String]
  },

  // Performance Metrics
  performanceMetrics: [PerformanceMetricSchema],

  // Quality & Certifications
  quality: {
    qualityRating: { type: Number, min: 1, max: 5 },
    qualityGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C'] },
    certifications: [String],
    qualityAgreements: [String],
    lastQualityAudit: { type: Date },
    nextQualityAudit: { type: Date },
    qualityNotes: { type: String },
    defectRate: { type: Number, default: 0, min: 0, max: 100 },
    returnRate: { type: Number, default: 0, min: 0, max: 100 }
  },

  // Relationship Management
  relationship: {
    supplierType: { 
      type: String, 
      enum: ['manufacturer', 'trader', 'distributor', 'agent', 'service_provider'], 
      required: true 
    },
    supplierCategory: { 
      type: String, 
      enum: ['strategic', 'preferred', 'approved', 'conditional', 'blacklisted'], 
      default: 'approved' 
    },
    relationshipManager: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedBuyer: { type: Schema.Types.ObjectId, ref: 'User' },
    supplierSince: { type: Date },
    lastInteraction: { type: Date },
    nextReview: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    exclusiveSupplier: { type: Boolean, default: false },
    strategicPartner: { type: Boolean, default: false }
  },

  // Compliance & Risk
  compliance: {
    vendorApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    approvalDate: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    complianceDocuments: [String], // URLs to uploaded documents
    riskCategory: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    blacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String },
    complianceNotes: { type: String },
    lastComplianceCheck: { type: Date },
    nextComplianceCheck: { type: Date },
    environmentalCompliance: { type: Boolean, default: false },
    laborCompliance: { type: Boolean, default: false },
    safetyCompliance: { type: Boolean, default: false }
  },

  // Additional Information
  notes: { type: String },
  tags: [String],
  customFields: { type: Schema.Types.Mixed },
  attachments: [String], // URLs to documents, images, etc.

  // Status & Tracking
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  collection: 'suppliers'
});

// Compound Indexes
SupplierSchema.index({ companyId: 1, supplierCode: 1 }, { unique: true });
SupplierSchema.index({ companyId: 1, 'contactInfo.primaryEmail': 1 });
SupplierSchema.index({ companyId: 1, 'contactInfo.primaryPhone': 1 });
SupplierSchema.index({ companyId: 1, 'registrationDetails.gstin': 1 });
SupplierSchema.index({ companyId: 1, 'relationship.supplierType': 1 });
SupplierSchema.index({ companyId: 1, 'relationship.supplierCategory': 1 });
SupplierSchema.index({ companyId: 1, 'compliance.vendorApprovalStatus': 1 });
SupplierSchema.index({ companyId: 1, isActive: 1 });

// Text search index
SupplierSchema.index({ 
  supplierName: 'text', 
  supplierCode: 'text',
  legalName: 'text',
  'contactInfo.primaryEmail': 'text',
  'contactInfo.primaryPhone': 'text'
});

// Pre-save middleware
SupplierSchema.pre('save', function(next) {
  // Set display name if not provided
  if (!this.displayName) {
    this.displayName = this.supplierName;
  }
  
  // Ensure at least one address is primary
  if (this.addresses && this.addresses.length > 0) {
    const primaryAddresses = this.addresses.filter(addr => addr.isPrimary);
    if (primaryAddresses.length === 0) {
      this.addresses[0].isPrimary = true;
    } else if (primaryAddresses.length > 1) {
      this.addresses.forEach((addr, index) => {
        addr.isPrimary = index === 0;
      });
    }
  }
  
  // Ensure at least one contact person is primary
  if (this.contactPersons && this.contactPersons.length > 0) {
    const primaryContacts = this.contactPersons.filter(contact => contact.isPrimary);
    if (primaryContacts.length === 0) {
      this.contactPersons[0].isPrimary = true;
    } else if (primaryContacts.length > 1) {
      this.contactPersons.forEach((contact, index) => {
        contact.isPrimary = index === 0;
      });
    }
  }
  
  // Calculate average order value
  if (this.supplyHistory.totalOrders > 0) {
    this.supplyHistory.averageOrderValue = 
      this.supplyHistory.totalOrderValue / this.supplyHistory.totalOrders;
  }
  
  next();
});

// Instance methods
SupplierSchema.methods.getPrimaryAddress = function(type?: string) {
  if (type) {
    return this.addresses.find(addr => addr.type === type && addr.isPrimary && addr.isActive);
  }
  return this.addresses.find(addr => addr.isPrimary && addr.isActive);
};

SupplierSchema.methods.getPrimaryContact = function() {
  return this.contactPersons.find(contact => contact.isPrimary && contact.isActive);
};

SupplierSchema.methods.getQualityScore = function() {
  const onTimeScore = this.supplyHistory.onTimeDeliveryRate || 0;
  const qualityScore = 100 - (this.supplyHistory.qualityRejectionRate || 0);
  const overallRating = (this.quality.qualityRating || 3) * 20; // Convert 1-5 to 0-100
  
  return (onTimeScore + qualityScore + overallRating) / 3;
};

SupplierSchema.methods.isApproved = function() {
  return this.compliance.vendorApprovalStatus === 'approved' && 
         !this.compliance.blacklisted && 
         this.isActive;
};

SupplierSchema.methods.canSupply = function(productCategory: string) {
  return this.productCategories.some(cat => 
    cat.category === productCategory && cat.isActive
  );
};

// Static methods
SupplierSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId, isActive: true });
};

SupplierSchema.statics.findApproved = function(companyId: string) {
  return this.find({ 
    companyId, 
    'compliance.vendorApprovalStatus': 'approved',
    'compliance.blacklisted': false,
    isActive: true 
  });
};

SupplierSchema.statics.findByCategory = function(companyId: string, category: string) {
  return this.find({
    companyId,
    'productCategories.category': category,
    'productCategories.isActive': true,
    isActive: true
  });
};

SupplierSchema.statics.findTopPerformers = function(companyId: string, limit: number = 10) {
  return this.find({ companyId, isActive: true })
    .sort({ 
      'supplyHistory.onTimeDeliveryRate': -1,
      'quality.qualityRating': -1,
      'supplyHistory.totalOrderValue': -1
    })
    .limit(limit);
};

export default model<ISupplier>('Supplier', SupplierSchema);
