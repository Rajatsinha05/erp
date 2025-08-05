import mongoose from 'mongoose';
export interface TwoFactorSetupResponse {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
}
export interface TwoFactorStatusResponse {
    isEnabled: boolean;
    backupCodesCount: number;
    lastUsed?: Date;
}
export interface TwoFactorEnableResponse {
    backupCodes: string[];
    message: string;
}
export interface TwoFactorTestResponse {
    verified: boolean;
    message: string;
}
export declare class TwoFactorService {
    static setupTwoFactor(userId: string | mongoose.Types.ObjectId): Promise<TwoFactorSetupResponse>;
    static enableTwoFactor(userId: string | mongoose.Types.ObjectId, token: string): Promise<TwoFactorEnableResponse>;
    static disableTwoFactor(userId: string | mongoose.Types.ObjectId, password: string, token?: string): Promise<{
        message: string;
    }>;
    static verifyToken(userId: string | mongoose.Types.ObjectId, token: string, isBackupCode?: boolean): Promise<boolean>;
    static getTwoFactorStatus(userId: string | mongoose.Types.ObjectId): Promise<TwoFactorStatusResponse>;
    static generateBackupCodes(userId: string | mongoose.Types.ObjectId, password: string): Promise<TwoFactorEnableResponse>;
    static testToken(secret: string, token: string): Promise<TwoFactorTestResponse>;
    static isUserTwoFactorEnabled(userId: string | mongoose.Types.ObjectId): Promise<boolean>;
}
export default TwoFactorService;
//# sourceMappingURL=TwoFactorService.d.ts.map