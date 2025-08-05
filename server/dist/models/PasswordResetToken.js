"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const passwordResetTokenSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000)
    },
    used: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});
passwordResetTokenSchema.index({ token: 1 });
passwordResetTokenSchema.index({ userId: 1 });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date();
});
passwordResetTokenSchema.virtual('isValid').get(function () {
    return !this.used && !this.isExpired;
});
passwordResetTokenSchema.statics.generateToken = function () {
    return crypto_1.default.randomBytes(32).toString('hex');
};
passwordResetTokenSchema.statics.createResetToken = async function (userId, companyId, email, ipAddress, userAgent) {
    await this.deleteMany({ userId, companyId });
    const token = this.generateToken();
    const resetToken = new this({
        userId,
        companyId,
        email,
        token,
        ipAddress,
        userAgent
    });
    await resetToken.save();
    return resetToken;
};
passwordResetTokenSchema.methods.markAsUsed = async function () {
    this.used = true;
    this.usedAt = new Date();
    await this.save();
};
passwordResetTokenSchema.statics.verifyToken = async function (token) {
    const resetToken = await this.findOne({ token }).populate('userId');
    if (!resetToken || !resetToken.isValid) {
        return null;
    }
    return resetToken;
};
passwordResetTokenSchema.statics.cleanupExpired = async function () {
    const result = await this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { used: true, usedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
    });
    return result.deletedCount || 0;
};
passwordResetTokenSchema.index({ companyId: 1, userId: 1 });
passwordResetTokenSchema.index({ companyId: 1, token: 1 });
passwordResetTokenSchema.index({ companyId: 1, expiresAt: 1 });
exports.default = mongoose_1.default.model('PasswordResetToken', passwordResetTokenSchema);
//# sourceMappingURL=PasswordResetToken.js.map