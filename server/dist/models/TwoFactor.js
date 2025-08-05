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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const backupCodeSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    }
});
const twoFactorSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        unique: true,
    },
    secret: {
        type: String,
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: false
    },
    backupCodes: [backupCodeSchema],
    lastUsed: {
        type: Date
    },
    setupAt: {
        type: Date
    },
    enabledAt: {
        type: Date
    },
    disabledAt: {
        type: Date
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: {
        type: Date
    }
}, {
    timestamps: true
});
twoFactorSchema.index({ 'backupCodes.code': 1 });
twoFactorSchema.virtual('isLocked').get(function () {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
});
twoFactorSchema.methods.generateBackupCodes = async function () {
    const codes = [];
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const hashedCode = await bcryptjs_1.default.hash(code, 12);
        codes.push(code);
        backupCodes.push({
            code: hashedCode,
            used: false
        });
    }
    this.backupCodes = backupCodes;
    return codes;
};
twoFactorSchema.methods.verifyBackupCode = async function (inputCode) {
    for (let i = 0; i < this.backupCodes.length; i++) {
        const backupCode = this.backupCodes[i];
        if (!backupCode.used && await bcryptjs_1.default.compare(inputCode, backupCode.code)) {
            backupCode.used = true;
            backupCode.usedAt = new Date();
            await this.save();
            return true;
        }
    }
    return false;
};
twoFactorSchema.methods.getUnusedBackupCodesCount = function () {
    return this.backupCodes.filter(code => !code.used).length;
};
twoFactorSchema.methods.handleFailedAttempt = async function () {
    this.failedAttempts += 1;
    if (this.failedAttempts >= 5) {
        this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await this.save();
};
twoFactorSchema.methods.resetFailedAttempts = async function () {
    this.failedAttempts = 0;
    this.lockedUntil = undefined;
    await this.save();
};
twoFactorSchema.methods.enable = async function () {
    this.isEnabled = true;
    this.enabledAt = new Date();
    this.disabledAt = undefined;
    await this.save();
};
twoFactorSchema.methods.disable = async function () {
    this.isEnabled = false;
    this.disabledAt = new Date();
    this.backupCodes = [];
    await this.save();
};
twoFactorSchema.index({ isEnabled: 1 });
exports.default = mongoose_1.default.model('TwoFactor', twoFactorSchema);
//# sourceMappingURL=TwoFactor.js.map