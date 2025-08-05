# Complete ERP System Implementation Guide

## 🚀 Quick Start Implementation

### 1. Database Setup
```javascript
// MongoDB Connection with Multi-tenant Support
const mongoose = require('mongoose');
const models = require('./models/complete-erp-models');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/factory_erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create indexes for optimal performance
await models.Company.createIndexes();
await models.User.createIndexes();
await models.InventoryItem.createIndexes();
// ... create indexes for all models
```

### 2. Company Setup (Multi-tenant)
```javascript
// Create companies for the three businesses
const companies = [
  {
    companyCode: 'DHRUVAL',
    companyName: 'Dhruval Exim Private Limited',
    legalName: 'Dhruval Exim Private Limited',
    registrationDetails: {
      gstin: '24XXXXX1234X1ZX',
      pan: 'XXXXX1234X',
      // ... other details
    }
  },
  {
    companyCode: 'JINAL',
    companyName: 'Jinal Industries (Amar)',
    legalName: 'Jinal Industries',
    // ... details
  },
  {
    companyCode: 'VIMAL',
    companyName: 'Vimal Process',
    legalName: 'Vimal Process',
    // ... details
  }
];

// Insert companies
for (const companyData of companies) {
  const company = new models.Company(companyData);
  await company.save();
}
```

### 3. User Management Setup
```javascript
// Create super admin user
const superAdmin = new models.User({
  username: 'superadmin',
  email: 'admin@dhruvalexim.com',
  password: 'hashedPassword', // Use bcrypt
  personalInfo: {
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+919876543210'
  },
  companyAccess: [
    {
      companyId: dhruvalCompanyId,
      role: 'super_admin',
      permissions: {
        // All permissions set to true
        inventory: { view: true, create: true, edit: true, delete: true, approve: true },
        production: { view: true, create: true, edit: true, delete: true, approve: true },
        // ... all other permissions
      }
    }
  ]
});
await superAdmin.save();
```

## 📊 API Implementation Examples

### 1. Company-wise Data Filtering Middleware
```javascript
// Middleware to ensure company-wise data isolation
const companyFilter = (req, res, next) => {
  const userCompanyId = req.user.currentCompanyId;
  req.companyFilter = { companyId: userCompanyId };
  next();
};

// Usage in routes
app.get('/api/inventory', companyFilter, async (req, res) => {
  const items = await models.InventoryItem.find(req.companyFilter);
  res.json(items);
});
```

### 2. Inventory Management APIs
```javascript
// Create inventory item
app.post('/api/inventory', companyFilter, async (req, res) => {
  const itemData = {
    ...req.body,
    companyId: req.user.currentCompanyId,
    companyItemCode: `${req.user.companyCode}_${req.body.itemCode}`,
    createdBy: req.user._id
  };
  
  const item = new models.InventoryItem(itemData);
  await item.save();
  res.json(item);
});

// Stock movement with automatic stock update
app.post('/api/stock-movement', companyFilter, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create stock movement
    const movement = new models.StockMovement({
      ...req.body,
      companyId: req.user.currentCompanyId,
      createdBy: req.user._id
    });
    await movement.save({ session });
    
    // Update inventory item stock
    const item = await models.InventoryItem.findById(req.body.itemId).session(session);
    if (req.body.movementType === 'inward') {
      item.stock.currentStock += req.body.quantity;
    } else if (req.body.movementType === 'outward') {
      item.stock.currentStock -= req.body.quantity;
    }
    item.stock.availableStock = item.stock.currentStock - item.stock.reservedStock;
    await item.save({ session });
    
    await session.commitTransaction();
    res.json(movement);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
});
```

### 3. Production Order Management
```javascript
// Create production order with BOM
app.post('/api/production-order', companyFilter, async (req, res) => {
  const productionOrder = new models.ProductionOrder({
    ...req.body,
    companyId: req.user.currentCompanyId,
    productionOrderNumber: generateOrderNumber(req.user.companyCode),
    createdBy: req.user._id
  });
  
  await productionOrder.save();
  
  // Create stock reservations for raw materials
  for (const material of req.body.rawMaterials) {
    await models.InventoryItem.findByIdAndUpdate(
      material.itemId,
      { $inc: { 'stock.reservedStock': material.requiredQuantity } }
    );
  }
  
  res.json(productionOrder);
});

// Update production stage
app.put('/api/production-order/:id/stage/:stageId', async (req, res) => {
  const { id, stageId } = req.params;
  const updateData = req.body;
  
  const productionOrder = await models.ProductionOrder.findById(id);
  const stage = productionOrder.productionStages.id(stageId);
  
  Object.assign(stage, updateData);
  stage.updatedBy = req.user._id;
  stage.updatedAt = new Date();
  
  await productionOrder.save();
  res.json(stage);
});
```

### 4. Photo Verification Implementation
```javascript
// Boiler monitoring with photo verification
app.post('/api/boiler-monitoring', upload.single('temperaturePhoto'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Temperature meter photo is required' });
  }
  
  const boilerReading = new models.BoilerMonitoring({
    ...req.body,
    companyId: req.user.currentCompanyId,
    photoVerification: {
      temperatureMeterPhoto: req.file.location, // S3 URL
      photoTakenBy: req.user._id,
      photoTimestamp: new Date(),
      gpsLocation: req.body.gpsLocation
    },
    createdBy: req.user._id
  });
  
  await boilerReading.save();
  res.json(boilerReading);
});

// Dispatch with mandatory photos
app.post('/api/dispatch', upload.array('photos', 10), async (req, res) => {
  const requiredPhotos = ['packedGoods', 'boxLabeling', 'quantityOverview'];
  const uploadedPhotos = req.files.map(file => ({
    type: file.fieldname,
    url: file.location
  }));
  
  // Validate required photos
  for (const photoType of requiredPhotos) {
    if (!uploadedPhotos.find(p => p.type === photoType)) {
      return res.status(400).json({ 
        error: `${photoType} photo is required for dispatch` 
      });
    }
  }
  
  const dispatch = new models.Dispatch({
    ...req.body,
    companyId: req.user.currentCompanyId,
    photoVerification: {
      packedGoodsPhotos: uploadedPhotos.filter(p => p.type === 'packedGoods').map(p => p.url),
      boxLabelingPhotos: uploadedPhotos.filter(p => p.type === 'boxLabeling').map(p => p.url),
      quantityOverviewPhotos: uploadedPhotos.filter(p => p.type === 'quantityOverview').map(p => p.url),
      photosTakenBy: req.user._id
    },
    createdBy: req.user._id
  });
  
  await dispatch.save();
  res.json(dispatch);
});
```

## 🔐 Security Implementation

### 1. Role-based Access Control
```javascript
// Permission checking middleware
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    const userAccess = await models.User.findById(req.user._id)
      .populate('companyAccess');
    
    const currentCompanyAccess = userAccess.companyAccess
      .find(access => access.companyId.toString() === req.user.currentCompanyId);
    
    if (!currentCompanyAccess.permissions[module][action]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage
app.post('/api/inventory', 
  companyFilter, 
  checkPermission('inventory', 'create'), 
  async (req, res) => {
    // Create inventory item
  }
);
```

### 2. Audit Logging
```javascript
// Audit logging middleware
const auditLog = (resource, action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action
      const auditEntry = new models.AuditLog({
        companyId: req.user.currentCompanyId,
        userId: req.user._id,
        userName: req.user.personalInfo.displayName,
        userRole: req.user.currentRole,
        action: action,
        resource: resource,
        resourceId: req.params.id,
        sessionDetails: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        },
        requestDetails: {
          method: req.method,
          endpoint: req.originalUrl,
          requestBody: req.body
        }
      });
      
      auditEntry.save().catch(console.error);
      originalSend.call(this, data);
    };
    
    next();
  };
};
```

## 📱 Mobile App Integration

### 1. Photo Upload with GPS
```javascript
// Mobile photo upload endpoint
app.post('/api/mobile/photo-upload', 
  upload.single('photo'), 
  async (req, res) => {
    const photoData = {
      url: req.file.location,
      metadata: {
        takenBy: req.user._id,
        timestamp: new Date(),
        gpsLocation: {
          latitude: req.body.latitude,
          longitude: req.body.longitude
        },
        deviceInfo: {
          deviceType: req.body.deviceType,
          appVersion: req.body.appVersion
        }
      }
    };
    
    res.json(photoData);
  }
);
```

### 2. Offline Sync Support
```javascript
// Sync endpoint for offline data
app.post('/api/sync', async (req, res) => {
  const { offlineData, lastSyncTimestamp } = req.body;
  
  // Process offline data
  for (const record of offlineData) {
    try {
      const Model = models[record.modelName];
      const document = new Model({
        ...record.data,
        companyId: req.user.currentCompanyId,
        createdBy: req.user._id
      });
      await document.save();
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
  
  // Return updated data since last sync
  const updatedData = await getUpdatedDataSince(
    req.user.currentCompanyId, 
    lastSyncTimestamp
  );
  
  res.json({ 
    success: true, 
    updatedData,
    syncTimestamp: new Date()
  });
});
```

This implementation guide provides the foundation for building a complete ERP system with all the advanced features defined in the models.
