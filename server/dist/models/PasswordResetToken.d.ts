import mongoose, { Document } from 'mongoose';
export interface IPasswordResetToken extends Document {
    userId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    token: string;
    email: string;
    expiresAt: Date;
    used: boolean;
    usedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    isExpired: boolean;
    isValid: boolean;
    markAsUsed(): Promise<void>;
}
export interface IPasswordResetTokenModel extends mongoose.Model<IPasswordResetToken> {
    generateToken(): string;
    createResetToken(userId: mongoose.Types.ObjectId, companyId: mongoose.Types.ObjectId, email: string, ipAddress?: string, userAgent?: string): Promise<IPasswordResetToken>;
    verifyToken(token: string): Promise<IPasswordResetToken | null>;
    cleanupExpired(): Promise<number>;
}
declare const _default: IPasswordResetTokenModel;
export default _default;
//# sourceMappingURL=PasswordResetToken.d.ts.map