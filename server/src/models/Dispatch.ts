import { Schema, model } from 'mongoose';
import { IDispatch, IDispatchItem, IDispatchTransportDetails, IDeliveryTracking } from '@/types/models';

const DispatchItemSchema = new Schema<IDispatchItem>({
  itemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  itemCode: { type: String, required: true },
  itemName: { type: String, required: true },
  description: { type: String },
  batchNumber: { type: String },
  serialNumbers: [String],
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  weight: { type: Number, min: 0 }, // kg
  volume: { type: Number, min: 0 }, // cubic meters
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  packingType: { type: String, enum: ['box', 'carton', 'pallet', 'bag', 'drum', 'loose'], required: true },
  packingDetails: {
    packagesCount: { type: Number, required: true, min: 1 },
    packageType: { type: String },
    packageWeight: { type: Number, min: 0 },
    packageDimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    }
  },
  handlingInstructions: [String],
  specialRequirements: [String],
  isHazardous: { type: Boolean, default: false },
  hazardClass: { type: String },
  storageConditions: { type: String },
  expiryDate: { type: Date },
  manufacturingDate: { type: Date },
  qualityStatus: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
  inspectionNotes: { type: String },
  unitPrice: { type: Number, min: 0 },
  totalValue: { type: Number, min: 0 },
  notes: { type: String }
}, { _id: false });

const TransportDetailsSchema = new Schema<IDispatchTransportDetails>({
  transportMode: { 
    type: String, 
    enum: ['road', 'rail', 'air', 'sea', 'courier', 'self_pickup'], 
    required: true 
  },
  transporterName: { type: String, required: true },
  transporterId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  vehicleType: { type: String, enum: ['truck', 'van', 'car', 'bike', 'train', 'ship', 'plane'] },
  vehicleNumber: { type: String },
  driverName: { type: String },
  driverPhone: { type: String },
  driverLicense: { type: String },
  routeDetails: {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    waypoints: [String],
    estimatedDistance: { type: Number, min: 0 }, // km
    estimatedDuration: { type: Number, min: 0 }, // hours
    routeType: { type: String, enum: ['direct', 'multi_stop', 'return'] }
  },
  freightCharges: {
    baseRate: { type: Number, required: true, min: 0 },
    fuelSurcharge: { type: Number, default: 0, min: 0 },
    tollCharges: { type: Number, default: 0, min: 0 },
    loadingCharges: { type: Number, default: 0, min: 0 },
    unloadingCharges: { type: Number, default: 0, min: 0 },
    insuranceCharges: { type: Number, default: 0, min: 0 },
    otherCharges: { type: Number, default: 0, min: 0 },
    totalCharges: { type: Number, required: true, min: 0 }
  },
  insuranceDetails: {
    isInsured: { type: Boolean, default: false },
    insuranceProvider: { type: String },
    policyNumber: { type: String },
    coverageAmount: { type: Number, min: 0 },
    premium: { type: Number, min: 0 }
  },
  trackingNumber: { type: String },
  awbNumber: { type: String }, // Air Way Bill
  lrNumber: { type: String }, // Lorry Receipt
  podRequired: { type: Boolean, default: true }, // Proof of Delivery
  estimatedPickupTime: { type: Date },
  estimatedDeliveryTime: { type: Date },
  actualPickupTime: { type: Date },
  actualDeliveryTime: { type: Date }
}, { _id: false });

const DeliveryTrackingSchema = new Schema<IDeliveryTracking>({
  trackingDateTime: { type: Date, required: true, default: Date.now },
  status: { 
    type: String, 
    enum: ['dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'failed_delivery', 'returned'], 
    required: true 
  },
  location: { type: String, required: true },
  description: { type: String, required: true },
  updatedBy: { type: String },
  contactPerson: { type: String },
  contactPhone: { type: String },
  gpsCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  photos: [String], // URLs to delivery photos
  signature: { type: String }, // URL to delivery signature
  remarks: { type: String },
  nextExpectedUpdate: { type: Date },
  isCustomerNotified: { type: Boolean, default: false },
  notificationMethod: { type: String, enum: ['sms', 'email', 'call', 'whatsapp'] }
}, { _id: false });

const DispatchSchema = new Schema<IDispatch>({
  companyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true, 
    index: true 
  },

  // Dispatch Identification
  dispatchNumber: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  dispatchDate: { 
    type: Date, 
    required: true, 
    default: Date.now,
    index: true
  },
  dispatchType: {
    type: String,
    enum: ['sales', 'transfer', 'return', 'sample', 'replacement', 'warranty', 'loan'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // Source Information
  source: {
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    warehouseName: { type: String, required: true },
    address: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    contactPerson: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String }
  },

  // Destination Information
  destination: {
    destinationType: { type: String, enum: ['customer', 'warehouse', 'branch', 'vendor', 'other'], required: true },
    destinationId: { type: Schema.Types.ObjectId }, // Reference to Customer, Warehouse, etc.
    destinationName: { type: String, required: true },
    address: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },
    contactPerson: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String },
    deliveryInstructions: { type: String },
    workingHours: { type: String },
    accessInstructions: { type: String }
  },

  // Reference Documents
  references: {
    salesOrderId: { type: Schema.Types.ObjectId, ref: 'CustomerOrder' },
    salesOrderNumber: { type: String },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    invoiceNumber: { type: String },
    transferOrderId: { type: Schema.Types.ObjectId, ref: 'TransferOrder' },
    transferOrderNumber: { type: String },
    returnOrderId: { type: Schema.Types.ObjectId, ref: 'ReturnOrder' },
    returnOrderNumber: { type: String },
    gatePassNumber: { type: String },
    customsDeclaration: { type: String }
  },

  // Dispatch Items
  items: [DispatchItemSchema],
  totalItems: { type: Number, default: 0, min: 0 },
  totalQuantity: { type: Number, default: 0, min: 0 },
  totalWeight: { type: Number, default: 0, min: 0 }, // kg
  totalVolume: { type: Number, default: 0, min: 0 }, // cubic meters
  totalValue: { type: Number, default: 0, min: 0 },

  // Packing Information
  packingDetails: {
    totalPackages: { type: Number, required: true, min: 1 },
    packingList: [String], // URLs to packing list documents
    packingMethod: { type: String, enum: ['standard', 'export', 'fragile', 'hazardous'] },
    packingMaterial: [String],
    packingCost: { type: Number, default: 0, min: 0 },
    packedBy: { type: String },
    packedAt: { type: Date },
    packingNotes: { type: String },
    specialHandling: [String]
  },

  // Transport & Logistics
  transport: TransportDetailsSchema,

  // Status & Tracking
  status: {
    type: String,
    enum: ['draft', 'ready_to_dispatch', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'partially_delivered', 'failed_delivery', 'returned', 'cancelled'],
    default: 'draft',
    index: true
  },
  dispatchedAt: { type: Date },
  dispatchedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deliveredAt: { type: Date },
  deliveredBy: { type: String },
  receivedBy: { type: String },
  receivedAt: { type: Date },

  // Delivery Tracking
  tracking: [DeliveryTrackingSchema],
  currentLocation: { type: String },
  estimatedDelivery: { type: Date },
  deliveryAttempts: { type: Number, default: 0, min: 0 },
  lastDeliveryAttempt: { type: Date },
  deliveryFailureReason: { type: String },

  // Quality & Inspection
  qualityCheck: {
    isRequired: { type: Boolean, default: false },
    checkedBy: { type: String },
    checkedAt: { type: Date },
    qualityStatus: { type: String, enum: ['passed', 'failed', 'conditional'], default: 'passed' },
    defects: [String],
    qualityNotes: { type: String },
    qualityCertificate: { type: String } // URL to quality certificate
  },

  // Documentation
  documents: {
    packingList: { type: String }, // URL
    invoiceCopy: { type: String }, // URL
    deliveryNote: { type: String }, // URL
    transportDocument: { type: String }, // URL
    insuranceCertificate: { type: String }, // URL
    customsDocuments: [String], // URLs
    qualityCertificates: [String], // URLs
    photos: [String], // URLs to dispatch photos
    proofOfDelivery: { type: String }, // URL
    customerSignature: { type: String } // URL
  },

  // Financial Information
  financials: {
    goodsValue: { type: Number, required: true, min: 0 },
    freightCharges: { type: Number, default: 0, min: 0 },
    packingCharges: { type: Number, default: 0, min: 0 },
    insuranceCharges: { type: Number, default: 0, min: 0 },
    handlingCharges: { type: Number, default: 0, min: 0 },
    otherCharges: { type: Number, default: 0, min: 0 },
    totalCharges: { type: Number, required: true, min: 0 },
    paymentTerms: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'cod'], default: 'pending' }
  },

  // Customer Feedback
  customerFeedback: {
    deliveryRating: { type: Number, min: 1, max: 5 },
    packagingRating: { type: Number, min: 1, max: 5 },
    timelinessRating: { type: Number, min: 1, max: 5 },
    overallRating: { type: Number, min: 1, max: 5 },
    comments: { type: String },
    complaints: [String],
    suggestions: [String],
    feedbackDate: { type: Date },
    wouldRecommend: { type: Boolean }
  },

  // Performance Metrics
  performance: {
    plannedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    deliveryDelay: { type: Number, default: 0 }, // hours
    onTimeDelivery: { type: Boolean },
    deliveryAccuracy: { type: Number, min: 0, max: 100 }, // percentage
    damageRate: { type: Number, min: 0, max: 100 }, // percentage
    customerSatisfaction: { type: Number, min: 0, max: 100 }, // percentage
    costPerKg: { type: Number, min: 0 },
    costPerKm: { type: Number, min: 0 }
  },

  // Additional Information
  specialInstructions: { type: String },
  internalNotes: { type: String },
  customerNotes: { type: String },
  tags: [String],
  customFields: { type: Schema.Types.Mixed },

  // Tracking & Audit
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  dispatchManagerId: { type: Schema.Types.ObjectId, ref: 'User' },
  dispatchManagerName: { type: String }
}, {
  timestamps: true,
  collection: 'dispatches'
});

// Compound Indexes for optimal performance
DispatchSchema.index({ companyId: 1, dispatchNumber: 1 }, { unique: true });
DispatchSchema.index({ companyId: 1, dispatchDate: -1 });
DispatchSchema.index({ companyId: 1, status: 1, dispatchDate: -1 });
DispatchSchema.index({ companyId: 1, 'destination.destinationId': 1 });
DispatchSchema.index({ companyId: 1, 'source.warehouseId': 1 });
DispatchSchema.index({ companyId: 1, dispatchType: 1 });
DispatchSchema.index({ 'transport.trackingNumber': 1 });

// Text search index
DispatchSchema.index({ 
  dispatchNumber: 'text', 
  'destination.destinationName': 'text',
  'transport.transporterName': 'text'
});

// Pre-save middleware
DispatchSchema.pre('save', function(next) {
  // Calculate totals
  this.totalItems = this.items.length;
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalWeight = this.items.reduce((sum, item) => sum + (item.weight || 0), 0);
  this.totalVolume = this.items.reduce((sum, item) => sum + (item.volume || 0), 0);
  this.totalValue = this.items.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  
  // Update financial totals
  this.financials.totalCharges = this.financials.goodsValue + 
                                this.financials.freightCharges + 
                                this.financials.packingCharges + 
                                this.financials.insuranceCharges + 
                                this.financials.handlingCharges + 
                                this.financials.otherCharges;
  
  // Calculate performance metrics
  if (this.performance.plannedDeliveryTime && this.performance.actualDeliveryTime) {
    const plannedTime = this.performance.plannedDeliveryTime.getTime();
    const actualTime = this.performance.actualDeliveryTime.getTime();
    this.performance.deliveryDelay = Math.max(0, (actualTime - plannedTime) / (1000 * 60 * 60)); // hours
    this.performance.onTimeDelivery = actualTime <= plannedTime;
  }
  
  next();
});

// Instance methods
DispatchSchema.methods.addTracking = function(trackingData: any) {
  this.tracking.push(trackingData);
  this.currentLocation = trackingData.location;
  
  // Update status based on tracking
  if (trackingData.status) {
    this.status = trackingData.status;
  }
  
  return this.save();
};

DispatchSchema.methods.isDelivered = function(): boolean {
  return this.status === 'delivered';
};

DispatchSchema.methods.isOverdue = function(): boolean {
  if (!this.estimatedDelivery || this.isDelivered()) return false;
  return new Date() > this.estimatedDelivery;
};

DispatchSchema.methods.getDaysOverdue = function(): number {
  if (!this.isOverdue()) return 0;
  const today = new Date();
  const diffTime = today.getTime() - this.estimatedDelivery!.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

DispatchSchema.methods.getLatestTracking = function() {
  return this.tracking.length > 0 ? this.tracking[this.tracking.length - 1] : null;
};

DispatchSchema.methods.calculateDeliveryCost = function(): number {
  return this.financials.totalCharges;
};

// Static methods
DispatchSchema.statics.findByCompany = function(companyId: string) {
  return this.find({ companyId, isActive: true }).sort({ dispatchDate: -1 });
};

DispatchSchema.statics.findInTransit = function(companyId: string) {
  return this.find({
    companyId,
    status: { $in: ['dispatched', 'in_transit', 'out_for_delivery'] },
    isActive: true
  }).sort({ dispatchDate: -1 });
};

DispatchSchema.statics.findOverdueDeliveries = function(companyId: string) {
  return this.find({
    companyId,
    status: { $nin: ['delivered', 'cancelled'] },
    estimatedDelivery: { $lt: new Date() },
    isActive: true
  }).sort({ estimatedDelivery: 1 });
};

DispatchSchema.statics.getDispatchStats = function(companyId: string, startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        companyId: new Schema.Types.ObjectId(companyId),
        dispatchDate: { $gte: startDate, $lte: endDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: {
          status: '$status',
          dispatchType: '$dispatchType'
        },
        count: { $sum: 1 },
        totalValue: { $sum: '$totalValue' },
        totalWeight: { $sum: '$totalWeight' },
        avgDeliveryTime: { $avg: '$performance.deliveryDelay' },
        onTimeDeliveryRate: {
          $avg: { $cond: ['$performance.onTimeDelivery', 1, 0] }
        }
      }
    }
  ]);
};

export default model<IDispatch>('Dispatch', DispatchSchema);
