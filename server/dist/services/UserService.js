"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const BaseService_1 = require("./BaseService");
const models_1 = require("@/models");
const errors_1 = require("../utils/errors");
const logger_1 = require("@/utils/logger");
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const environment_1 = __importDefault(require("@/config/environment"));
class UserService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.User);
    }
    async createUser(userData, createdBy) {
        try {
            await this.validateUserData(userData);
            const existingUsername = await this.findOne({ username: userData.username });
            if (existingUsername) {
                throw new errors_1.AppError('Username already exists', 400);
            }
            const existingEmail = await this.findOne({ email: userData.email });
            if (existingEmail) {
                throw new errors_1.AppError('Email already exists', 400);
            }
            if (userData.password) {
                const salt = await bcryptjs_1.default.genSalt(environment_1.default.BCRYPT_SALT_ROUNDS);
                userData.password = await bcryptjs_1.default.hash(userData.password, salt);
            }
            const userToCreate = {
                ...userData,
                isActive: true,
                isSuperAdmin: userData.isSuperAdmin || false,
                security: {
                    ...userData.security,
                    passwordLastChanged: new Date(),
                    loginAttempts: 0,
                    isLocked: false
                },
                preferences: {
                    language: 'en',
                    timezone: 'Asia/Kolkata',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: '24h',
                    ...userData.preferences
                }
            };
            const user = await this.create(userToCreate, createdBy);
            logger_1.logger.info('User created successfully', {
                userId: user._id,
                username: user.username,
                email: user.email,
                createdBy
            });
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error creating user', { error, userData, createdBy });
            throw error;
        }
    }
    async findByUsernameOrEmail(identifier) {
        try {
            return await this.findOne({
                $or: [
                    { username: identifier },
                    { email: identifier }
                ],
                isActive: true
            });
        }
        catch (error) {
            logger_1.logger.error('Error finding user by username or email', { error, identifier });
            throw error;
        }
    }
    async authenticateUser(identifier, password) {
        try {
            const user = await this.findOne({
                $or: [
                    { username: identifier },
                    { email: identifier },
                    { 'personalInfo.phone': identifier }
                ],
                isActive: true
            });
            if (!user) {
                return null;
            }
            if (user.security?.accountLocked) {
                throw new errors_1.AppError('Account is locked. Please contact administrator.', 423);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                await this.incrementLoginAttempts(user._id.toString());
                return null;
            }
            await this.resetLoginAttempts(user._id.toString());
            await this.update(user._id.toString(), {
                'security.lastLogin': new Date(),
                'security.lastLoginIP': undefined
            });
            return user;
        }
        catch (error) {
            logger_1.logger.error('Error authenticating user', { error, identifier });
            throw error;
        }
    }
    async addCompanyAccess(userId, companyId, role, permissions, assignedBy) {
        try {
            const company = await models_1.Company.findById(companyId);
            if (!company) {
                throw new errors_1.AppError('Company not found', 404);
            }
            const roleDoc = await models_1.Role.findOne({ roleName: role, companyId });
            if (!roleDoc) {
                throw new errors_1.AppError('Role not found for this company', 404);
            }
            const user = await this.findById(userId);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const existingAccess = user.companyAccess?.find(access => access.companyId.toString() === companyId);
            if (existingAccess) {
                throw new errors_1.AppError('User already has access to this company', 400);
            }
            const companyAccess = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                role: role,
                permissions: permissions || roleDoc.permissions,
                isActive: true,
                joinedAt: new Date()
            };
            const updatedUser = await this.update(userId, {
                $push: { companyAccess }
            });
            logger_1.logger.info('Company access added to user', { userId, companyId, role, assignedBy });
            return updatedUser;
        }
        catch (error) {
            logger_1.logger.error('Error adding company access', { error, userId, companyId, role });
            throw error;
        }
    }
    async removeCompanyAccess(userId, companyId, removedBy) {
        try {
            const updatedUser = await this.update(userId, {
                $pull: { companyAccess: { companyId: new mongoose_1.Types.ObjectId(companyId) } }
            }, removedBy);
            if (!updatedUser) {
                throw new errors_1.AppError('User not found', 404);
            }
            logger_1.logger.info('Company access removed from user', { userId, companyId, removedBy });
            return updatedUser;
        }
        catch (error) {
            logger_1.logger.error('Error removing company access', { error, userId, companyId });
            throw error;
        }
    }
    async updatePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new errors_1.AppError('Current password is incorrect', 400);
            }
            const salt = await bcryptjs_1.default.genSalt(environment_1.default.BCRYPT_SALT_ROUNDS);
            const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, salt);
            await this.update(userId, {
                password: hashedNewPassword,
                'security.passwordLastChanged': new Date(),
                'security.mustChangePassword': false
            });
            logger_1.logger.info('User password updated', { userId });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error updating user password', { error, userId });
            throw error;
        }
    }
    async resetPassword(userId, newPassword, resetBy) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const tempPassword = newPassword || this.generateTemporaryPassword();
            const salt = await bcryptjs_1.default.genSalt(environment_1.default.BCRYPT_SALT_ROUNDS);
            const hashedPassword = await bcryptjs_1.default.hash(tempPassword, salt);
            await this.update(userId, {
                password: hashedPassword,
                'security.passwordLastChanged': new Date(),
                'security.mustChangePassword': true,
                'security.passwordResetAt': new Date(),
                'security.passwordResetBy': resetBy ? new mongoose_1.Types.ObjectId(resetBy) : undefined
            });
            logger_1.logger.info('User password reset', { userId, resetBy });
            return tempPassword;
        }
        catch (error) {
            logger_1.logger.error('Error resetting user password', { error, userId });
            throw error;
        }
    }
    async toggleAccountLock(userId, isLocked, actionBy) {
        try {
            const updatedUser = await this.update(userId, {
                'security.isLocked': isLocked,
                'security.lockedAt': isLocked ? new Date() : undefined,
                'security.lockedBy': isLocked && actionBy ? new mongoose_1.Types.ObjectId(actionBy) : undefined,
                'security.unlockedAt': !isLocked ? new Date() : undefined,
                'security.unlockedBy': !isLocked && actionBy ? new mongoose_1.Types.ObjectId(actionBy) : undefined
            });
            if (!updatedUser) {
                throw new errors_1.AppError('User not found', 404);
            }
            logger_1.logger.info(`User account ${isLocked ? 'locked' : 'unlocked'}`, { userId, actionBy });
            return updatedUser;
        }
        catch (error) {
            logger_1.logger.error('Error toggling account lock', { error, userId, isLocked });
            throw error;
        }
    }
    async getUsersByCompany(companyId, page = 1, limit = 10) {
        try {
            const filter = {
                'companyAccess.companyId': new mongoose_1.Types.ObjectId(companyId),
                'companyAccess.isActive': true,
                isActive: true
            };
            return await this.paginate(filter, page, limit, { 'personalInfo.firstName': 1 });
        }
        catch (error) {
            logger_1.logger.error('Error getting users by company', { error, companyId });
            throw error;
        }
    }
    async searchUsers(searchTerm, companyId, page = 1, limit = 10) {
        try {
            const searchRegex = new RegExp(searchTerm, 'i');
            let filter = {
                isActive: true,
                $or: [
                    { username: searchRegex },
                    { email: searchRegex },
                    { 'personalInfo.firstName': searchRegex },
                    { 'personalInfo.lastName': searchRegex },
                    { 'personalInfo.displayName': searchRegex }
                ]
            };
            if (companyId) {
                filter['companyAccess.companyId'] = new mongoose_1.Types.ObjectId(companyId);
                filter['companyAccess.isActive'] = true;
            }
            return await this.paginate(filter, page, limit, { 'personalInfo.firstName': 1 });
        }
        catch (error) {
            logger_1.logger.error('Error searching users', { error, searchTerm, companyId });
            throw error;
        }
    }
    async incrementLoginAttempts(userId) {
        try {
            const user = await this.findById(userId);
            if (!user)
                return;
            const attempts = (user.security?.failedLoginAttempts || 0) + 1;
            const maxAttempts = environment_1.default.MAX_LOGIN_ATTEMPTS || 5;
            const updateData = {
                'security.loginAttempts': attempts,
                'security.lastFailedLogin': new Date()
            };
            if (attempts >= maxAttempts) {
                updateData['security.isLocked'] = true;
                updateData['security.lockedAt'] = new Date();
            }
            await this.update(userId, updateData);
        }
        catch (error) {
            logger_1.logger.error('Error incrementing login attempts', { error, userId });
        }
    }
    async resetLoginAttempts(userId) {
        try {
            await this.update(userId, {
                'security.loginAttempts': 0,
                $unset: { 'security.lastFailedLogin': 1 }
            });
        }
        catch (error) {
            logger_1.logger.error('Error resetting login attempts', { error, userId });
        }
    }
    generateTemporaryPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    async validateUserData(userData) {
        if (!userData.username) {
            throw new errors_1.AppError('Username is required', 400);
        }
        if (!userData.email) {
            throw new errors_1.AppError('Email is required', 400);
        }
        if (!userData.password) {
            throw new errors_1.AppError('Password is required', 400);
        }
        if (!userData.personalInfo?.firstName) {
            throw new errors_1.AppError('First name is required', 400);
        }
        if (!userData.personalInfo?.lastName) {
            throw new errors_1.AppError('Last name is required', 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new errors_1.AppError('Invalid email format', 400);
        }
        if (userData.password.length < 8) {
            throw new errors_1.AppError('Password must be at least 8 characters long', 400);
        }
        if (userData.username.length < 3) {
            throw new errors_1.AppError('Username must be at least 3 characters long', 400);
        }
        if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
            throw new errors_1.AppError('Username can only contain letters, numbers, and underscores', 400);
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map