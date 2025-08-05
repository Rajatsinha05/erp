import mongoose, { Document } from 'mongoose';
export interface IBackupCode {
    code: string;
    used: boolean;
    usedAt?: Date;
}
export interface ITwoFactor extends Document {
    userId: mongoose.Types.ObjectId;
    secret: string;
    isEnabled: boolean;
    backupCodes: IBackupCode[];
    lastUsed?: Date;
    setupAt?: Date;
    enabledAt?: Date;
    disabledAt?: Date;
    failedAttempts: number;
    lockedUntil?: Date;
    isLocked: boolean;
    generateBackupCodes(): Promise<string[]>;
    verifyBackupCode(inputCode: string): Promise<boolean>;
    getUnusedBackupCodesCount(): number;
    handleFailedAttempt(): Promise<void>;
    resetFailedAttempts(): Promise<void>;
    enable(): Promise<void>;
    disable(): Promise<void>;
}
declare const _default: mongoose.Model<ITwoFactor, {}, {}, {}, mongoose.Document<unknown, {}, ITwoFactor, {}> & ITwoFactor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TwoFactor.d.ts.map