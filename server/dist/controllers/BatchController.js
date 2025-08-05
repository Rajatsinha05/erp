"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchController = void 0;
const InventoryBatch_1 = require("@/models/InventoryBatch");
const InventoryItem_1 = __importDefault(require("@/models/InventoryItem"));
class BatchController {
    sendError(res, error, message = 'Internal server error', statusCode = 500) {
        console.error(error);
        res.status(statusCode).json({
            success: false,
            message,
            error: error.message
        });
    }
    async getAllBatches(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
                return;
            }
            const { itemId, processStage, qualityGrade, status, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            const matchStage = { companyId, isActive: true };
            if (itemId)
                matchStage.itemId = itemId;
            if (processStage)
                matchStage.processStage = processStage;
            if (qualityGrade)
                matchStage.qualityGrade = qualityGrade;
            if (status)
                matchStage.status = status;
            if (search) {
                matchStage.$or = [
                    { batchNumber: { $regex: search, $options: 'i' } },
                    { lotNumber: { $regex: search, $options: 'i' } },
                    { 'specifications.color': { $regex: search, $options: 'i' } },
                    { 'specifications.design': { $regex: search, $options: 'i' } }
                ];
            }
            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'inventory_items',
                        localField: 'itemId',
                        foreignField: '_id',
                        as: 'item'
                    }
                },
                { $unwind: '$item' },
                {
                    $lookup: {
                        from: 'suppliers',
                        localField: 'supplierId',
                        foreignField: '_id',
                        as: 'supplier'
                    }
                },
                {
                    $addFields: {
                        supplier: { $arrayElemAt: ['$supplier', 0] },
                        ageInDays: {
                            $divide: [
                                { $subtract: [new Date(), '$receivedDate'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {
                    $sort: sortOrder === 'desc' ? { [sortBy]: -1 } : { [sortBy]: 1 }
                },
                {
                    $facet: {
                        data: [
                            { $skip: (parseInt(page) - 1) * parseInt(limit) },
                            { $limit: parseInt(limit) }
                        ],
                        totalCount: [{ $count: 'count' }]
                    }
                }
            ];
            const result = await InventoryBatch_1.InventoryBatch.aggregate(pipeline);
            const data = result[0].data;
            const total = result[0].totalCount[0]?.count || 0;
            const totalPages = Math.ceil(total / parseInt(limit));
            res.status(200).json({
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages
                }
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get batches');
        }
    }
    async getBatchById(req, res) {
        try {
            const { id } = req.params;
            const companyId = req.user?.companyId;
            const batch = await InventoryBatch_1.InventoryBatch.findOne({ _id: id, companyId })
                .populate('itemId', 'itemCode itemName productType category')
                .populate('supplierId', 'supplierName supplierCode')
                .populate('createdBy', 'firstName lastName email')
                .populate('lastModifiedBy', 'firstName lastName email');
            if (!batch) {
                this.sendError(res, new Error('Batch not found'), 'Batch not found', 404);
                return;
            }
            res.status(200).json({ data: batch });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get batch');
        }
    }
    async createBatch(req, res) {
        try {
            const companyId = req.user?.companyId;
            const userId = req.user?.id;
            if (!companyId || !userId) {
                this.sendError(res, new Error('User context not found'), 'Authentication required', 401);
                return;
            }
            const batchData = {
                ...req.body,
                companyId,
                createdBy: userId,
                totalCost: req.body.initialQuantity * req.body.costPerUnit
            };
            const batch = new InventoryBatch_1.InventoryBatch(batchData);
            await batch.save();
            await this.updateItemStock(batch.itemId.toString(), batch.initialQuantity, 'add');
            res.status(201).json({
                data: batch,
                message: 'Batch created successfully'
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create batch');
        }
    }
    async updateBatch(req, res) {
        try {
            const { id } = req.params;
            const companyId = req.user?.companyId;
            const userId = req.user?.id;
            const batch = await InventoryBatch_1.InventoryBatch.findOne({ _id: id, companyId });
            if (!batch) {
                this.sendError(res, new Error('Batch not found'), 'Batch not found', 404);
                return;
            }
            const oldQuantity = batch.currentQuantity;
            const newQuantity = req.body.currentQuantity || oldQuantity;
            Object.assign(batch, req.body, {
                lastModifiedBy: userId,
                totalCost: newQuantity * (req.body.costPerUnit || batch.costPerUnit)
            });
            await batch.save();
            if (oldQuantity !== newQuantity) {
                const difference = newQuantity - oldQuantity;
                await this.updateItemStock(batch.itemId.toString(), Math.abs(difference), difference > 0 ? 'add' : 'subtract');
            }
            res.status(200).json({
                data: batch,
                message: 'Batch updated successfully'
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update batch');
        }
    }
    async getBatchSummaryByStage(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID not found'), 'Company ID is required', 400);
                return;
            }
            const summary = await InventoryBatch_1.InventoryBatch.aggregate([
                { $match: { companyId, isActive: true } },
                {
                    $group: {
                        _id: '$processStage',
                        totalBatches: { $sum: 1 },
                        totalQuantity: { $sum: '$currentQuantity' },
                        totalValue: { $sum: '$totalCost' },
                        avgQualityScore: { $avg: '$qualityScore' },
                        qualityDistribution: {
                            $push: '$qualityGrade'
                        }
                    }
                },
                {
                    $project: {
                        processStage: '$_id',
                        totalBatches: 1,
                        totalQuantity: 1,
                        totalValue: 1,
                        avgQualityScore: { $round: ['$avgQualityScore', 2] },
                        qualityDistribution: 1,
                        _id: 0
                    }
                },
                { $sort: { processStage: 1 } }
            ]);
            res.status(200).json({
                data: summary,
                total: summary.length
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get batch summary');
        }
    }
    async updateProcessStage(req, res) {
        try {
            const { id } = req.params;
            const { stage, operator, machineId, notes, qualityCheck } = req.body;
            const companyId = req.user?.companyId;
            const userId = req.user?.id;
            const batch = await InventoryBatch_1.InventoryBatch.findOne({ _id: id, companyId });
            if (!batch) {
                this.sendError(res, new Error('Batch not found'), 'Batch not found', 404);
                return;
            }
            if (batch.processHistory.length > 0) {
                const currentProcess = batch.processHistory[batch.processHistory.length - 1];
                if (!currentProcess.endDate) {
                    currentProcess.endDate = new Date();
                }
            }
            batch.processHistory.push({
                stage,
                startDate: new Date(),
                operator,
                machineId,
                notes,
                qualityCheck
            });
            batch.processStage = stage;
            batch.lastModifiedBy = userId;
            if (qualityCheck) {
                batch.qualityGrade = qualityCheck.grade;
                batch.qualityScore = qualityCheck.score;
                batch.qualityCheckDate = new Date();
                batch.qualityCheckedBy = qualityCheck.checkedBy;
            }
            await batch.save();
            res.status(200).json({
                data: batch,
                message: 'Process stage updated successfully'
            });
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update process stage');
        }
    }
    async updateItemStock(itemId, quantity, operation) {
        const item = await InventoryItem_1.default.findById(itemId);
        if (item) {
            if (operation === 'add') {
                item.stock.currentStock += quantity;
                item.stock.availableStock += quantity;
            }
            else {
                item.stock.currentStock = Math.max(0, item.stock.currentStock - quantity);
                item.stock.availableStock = Math.max(0, item.stock.availableStock - quantity);
            }
            item.stock.totalValue = item.stock.currentStock * item.stock.averageCost;
            await item.save();
        }
    }
}
exports.BatchController = BatchController;
//# sourceMappingURL=BatchController.js.map