"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const TwoFactor_1 = __importDefault(require("@/models/TwoFactor"));
const User_1 = __importDefault(require("@/models/User"));
class TwoFactorService {
    static async setupTwoFactor(userId) {
        try {
            const user = await User_1.default.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const secret = speakeasy_1.default.generateSecret({
                name: `ERP (${user.email})`,
                issuer: 'ERP System',
                length: 20
            });
            let twoFactor = await TwoFactor_1.default.findOne({ userId });
            if (!twoFactor) {
                twoFactor = new TwoFactor_1.default({
                    userId,
                    secret: secret.base32,
                    isEnabled: false
                });
            }
            else {
                twoFactor.secret = secret.base32;
                twoFactor.isEnabled = false;
                twoFactor.setupAt = new Date();
            }
            await twoFactor.save();
            const emailPart = user.email.split('@')[0];
            const shortLabel = emailPart.length > 4 ? emailPart.substring(0, 4) : emailPart;
            const shortSecret = secret.base32.substring(0, 16);
            const urlFormats = [
                `otpauth://totp/${shortLabel}?secret=${shortSecret}`,
                `otpauth://totp/ERP?secret=${shortSecret}`,
                `otpauth://totp/E?secret=${shortSecret}`
            ];
            console.log('Original secret length:', secret.base32.length);
            console.log('Short secret length:', shortSecret.length);
            for (let i = 0; i < urlFormats.length; i++) {
                const otpAuthUrl = urlFormats[i];
                console.log(`Trying URL format ${i + 1}:`, otpAuthUrl);
                console.log(`URL length: ${otpAuthUrl.length}`);
                try {
                    const qrCodeUrl = await qrcode_1.default.toDataURL(otpAuthUrl, {
                        errorCorrectionLevel: 'L',
                        margin: 0,
                        width: 80,
                        scale: 1
                    });
                    console.log(`QR Code generated successfully with format ${i + 1}`);
                    return {
                        secret: secret.base32,
                        qrCodeUrl,
                        backupCodes: []
                    };
                }
                catch (qrError) {
                    console.error(`QR Code generation failed for format ${i + 1}:`, qrError.message);
                    continue;
                }
            }
            console.error('All QR Code generation attempts failed');
            return {
                secret: secret.base32,
                qrCodeUrl: '',
                backupCodes: []
            };
        }
        catch (error) {
            throw new Error(`Failed to setup 2FA: ${error.message}`);
        }
    }
    static async enableTwoFactor(userId, token) {
        try {
            const twoFactor = await TwoFactor_1.default.findOne({ userId });
            if (!twoFactor) {
                throw new Error('2FA not set up. Please set up 2FA first.');
            }
            if (twoFactor.isEnabled) {
                throw new Error('2FA is already enabled');
            }
            const verified = speakeasy_1.default.totp.verify({
                secret: twoFactor.secret,
                encoding: 'base32',
                token,
                window: 2
            });
            if (!verified) {
                throw new Error('Invalid verification code');
            }
            const backupCodes = await twoFactor.generateBackupCodes();
            await twoFactor.enable();
            return {
                backupCodes,
                message: '2FA enabled successfully'
            };
        }
        catch (error) {
            throw new Error(`Failed to enable 2FA: ${error.message}`);
        }
    }
    static async disableTwoFactor(userId, password, token) {
        try {
            const user = await User_1.default.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }
            const twoFactor = await TwoFactor_1.default.findOne({ userId });
            if (!twoFactor || !twoFactor.isEnabled) {
                throw new Error('2FA is not enabled');
            }
            if (token) {
                const verified = await this.verifyToken(userId, token);
                if (!verified) {
                    throw new Error('Invalid 2FA token');
                }
            }
            await twoFactor.disable();
            return {
                message: '2FA disabled successfully'
            };
        }
        catch (error) {
            throw new Error(`Failed to disable 2FA: ${error.message}`);
        }
    }
    static async verifyToken(userId, token, isBackupCode = false) {
        try {
            const twoFactor = await TwoFactor_1.default.findOne({ userId });
            if (!twoFactor || !twoFactor.isEnabled) {
                return false;
            }
            if (twoFactor.isLocked) {
                throw new Error('Account temporarily locked due to too many failed attempts');
            }
            let verified = false;
            if (isBackupCode) {
                verified = await twoFactor.verifyBackupCode(token);
            }
            else {
                verified = speakeasy_1.default.totp.verify({
                    secret: twoFactor.secret,
                    encoding: 'base32',
                    token,
                    window: 2
                });
            }
            if (verified) {
                await twoFactor.resetFailedAttempts();
                twoFactor.lastUsed = new Date();
                await twoFactor.save();
                return true;
            }
            else {
                await twoFactor.handleFailedAttempt();
                return false;
            }
        }
        catch (error) {
            throw error;
        }
    }
    static async getTwoFactorStatus(userId) {
        try {
            const twoFactor = await TwoFactor_1.default.findOne({ userId });
            if (!twoFactor) {
                return {
                    isEnabled: false,
                    backupCodesCount: 0,
                    lastUsed: undefined
                };
            }
            return {
                isEnabled: twoFactor.isEnabled,
                backupCodesCount: twoFactor.getUnusedBackupCodesCount(),
                lastUsed: twoFactor.lastUsed
            };
        }
        catch (error) {
            throw new Error(`Failed to get 2FA status: ${error.message}`);
        }
    }
    static async generateBackupCodes(userId, password) {
        try {
            const user = await User_1.default.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }
            const twoFactor = await TwoFactor_1.default.findOne({ userId });
            if (!twoFactor || !twoFactor.isEnabled) {
                throw new Error('2FA is not enabled');
            }
            const backupCodes = await twoFactor.generateBackupCodes();
            await twoFactor.save();
            return {
                backupCodes,
                message: 'New backup codes generated successfully'
            };
        }
        catch (error) {
            throw new Error(`Failed to generate backup codes: ${error.message}`);
        }
    }
    static async testToken(secret, token) {
        try {
            const verified = speakeasy_1.default.totp.verify({
                secret,
                encoding: 'base32',
                token,
                window: 2
            });
            return {
                verified,
                message: verified ? 'Token verified successfully' : 'Invalid token'
            };
        }
        catch (error) {
            throw new Error(`Failed to test token: ${error.message}`);
        }
    }
    static async isUserTwoFactorEnabled(userId) {
        try {
            const twoFactor = await TwoFactor_1.default.findOne({ userId });
            return twoFactor ? twoFactor.isEnabled : false;
        }
        catch (error) {
            return false;
        }
    }
}
exports.TwoFactorService = TwoFactorService;
exports.default = TwoFactorService;
//# sourceMappingURL=TwoFactorService.js.map