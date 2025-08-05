"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const BaseController_1 = require("./BaseController");
const UserService_1 = require("@/services/UserService");
const errors_1 = require("@/utils/errors");
const logger_1 = require("@/utils/logger");
class UserController extends BaseController_1.BaseController {
    userService;
    constructor() {
        const userService = new UserService_1.UserService();
        super(userService, 'User');
        this.userService = userService;
    }
    async create(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { userId } = this.getUserInfo(req);
            const userData = req.body;
            logger_1.logger.info('Creating user', { userData: { ...userData, password: '[HIDDEN]' }, userId });
            const user = await this.userService.createUser(userData, userId);
            const userResponse = { ...user.toObject(), password: undefined };
            this.sendSuccess(res, userResponse, 'User created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const { userId } = this.getUserInfo(req);
            if (!userId) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            logger_1.logger.info('Getting user profile', { userId });
            const user = await this.userService.findById(userId, ['companyAccess.companyId']);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const userProfile = { ...user.toObject(), password: undefined };
            this.sendSuccess(res, userProfile, 'User profile retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { userId } = this.getUserInfo(req);
            const updateData = req.body;
            if (!userId) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            delete updateData.password;
            delete updateData.companyAccess;
            delete updateData.isSuperAdmin;
            delete updateData.security;
            logger_1.logger.info('Updating user profile', { userId, updateData });
            const user = await this.userService.update(userId, updateData, userId);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const userResponse = { ...user.toObject(), password: undefined };
            this.sendSuccess(res, userResponse, 'User profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { userId } = this.getUserInfo(req);
            const { currentPassword, newPassword } = req.body;
            if (!userId) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            logger_1.logger.info('Changing user password', { userId });
            const success = await this.userService.updatePassword(userId, currentPassword, newPassword);
            if (!success) {
                throw new errors_1.AppError('Failed to update password', 500);
            }
            this.sendSuccess(res, null, 'Password updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const { newPassword } = req.body;
            logger_1.logger.info('Resetting user password', { targetUserId: id, resetBy: userId });
            const tempPassword = await this.userService.resetPassword(id, newPassword, userId);
            this.sendSuccess(res, { temporaryPassword: tempPassword }, 'Password reset successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async toggleAccountLock(req, res, next) {
        try {
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const { isLocked } = req.body;
            logger_1.logger.info('Toggling account lock', { targetUserId: id, isLocked, actionBy: userId });
            const user = await this.userService.toggleAccountLock(id, isLocked, userId);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const userResponse = { ...user.toObject(), password: undefined };
            this.sendSuccess(res, userResponse, `User account ${isLocked ? 'locked' : 'unlocked'} successfully`);
        }
        catch (error) {
            next(error);
        }
    }
    async addCompanyAccess(req, res, next) {
        try {
            this.handleValidationErrors(req);
            const { id } = req.params;
            const { userId } = this.getUserInfo(req);
            const { companyId, role, permissions } = req.body;
            logger_1.logger.info('Adding company access to user', { targetUserId: id, companyId, role, assignedBy: userId });
            const user = await this.userService.addCompanyAccess(id, companyId, role, permissions, userId);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const userResponse = { ...user.toObject(), password: undefined };
            this.sendSuccess(res, userResponse, 'Company access added successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async removeCompanyAccess(req, res, next) {
        try {
            const { id, companyId } = req.params;
            const { userId } = this.getUserInfo(req);
            logger_1.logger.info('Removing company access from user', { targetUserId: id, companyId, removedBy: userId });
            const user = await this.userService.removeCompanyAccess(id, companyId, userId);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const userResponse = { ...user.toObject(), password: undefined };
            this.sendSuccess(res, userResponse, 'Company access removed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getUsersByCompany(req, res, next) {
        try {
            const { companyId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            logger_1.logger.info('Getting users by company', { companyId, page, limit });
            const result = await this.userService.getUsersByCompany(companyId, page, limit);
            result.documents = result.documents.map((user) => ({
                ...user.toObject(),
                password: undefined
            }));
            this.sendPaginatedResponse(res, result, 'Company users retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const { q: searchTerm } = req.query;
            const { companyId } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!searchTerm) {
                throw new errors_1.AppError('Search term is required', 400);
            }
            logger_1.logger.info('Searching users', { searchTerm, companyId, page, limit });
            const result = await this.userService.searchUsers(searchTerm, companyId, page, limit);
            result.documents = result.documents.map((user) => ({
                ...user.toObject(),
                password: undefined
            }));
            this.sendPaginatedResponse(res, result, 'User search results retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sort = req.query.sort || { 'personalInfo.firstName': 1 };
            const populate = req.query.populate;
            const filter = this.buildUserFilter(req.query);
            logger_1.logger.info('Getting users with filter', { page, limit, filter });
            const result = await this.userService.paginate(filter, page, limit, sort, populate);
            result.documents = result.documents.map((user) => ({
                ...user.toObject(),
                password: undefined
            }));
            this.sendPaginatedResponse(res, result, 'Users retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const populate = req.query.populate;
            logger_1.logger.info('Getting user by ID', { id });
            const user = await this.userService.findById(id, populate);
            if (!user) {
                throw new errors_1.AppError('User not found', 404);
            }
            const userResponse = { ...user.toObject(), password: undefined };
            this.sendSuccess(res, userResponse, 'User retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    buildUserFilter(query) {
        const filter = this.buildFilterFromQuery(query);
        if (query.username) {
            filter.username = new RegExp(query.username, 'i');
        }
        if (query.email) {
            filter.email = new RegExp(query.email, 'i');
        }
        if (query.firstName) {
            filter['personalInfo.firstName'] = new RegExp(query.firstName, 'i');
        }
        if (query.lastName) {
            filter['personalInfo.lastName'] = new RegExp(query.lastName, 'i');
        }
        if (query.department) {
            filter['workInfo.department'] = query.department;
        }
        if (query.designation) {
            filter['workInfo.designation'] = new RegExp(query.designation, 'i');
        }
        if (query.isSuperAdmin !== undefined) {
            filter.isSuperAdmin = query.isSuperAdmin === 'true';
        }
        if (query.isLocked !== undefined) {
            filter['security.isLocked'] = query.isLocked === 'true';
        }
        if (query.companyId) {
            filter['companyAccess.companyId'] = query.companyId;
            filter['companyAccess.isActive'] = true;
        }
        return filter;
    }
    async getUserStats(req, res, next) {
        try {
            const { companyId } = req.query;
            const filter = {};
            if (companyId) {
                filter['companyAccess.companyId'] = companyId;
                filter['companyAccess.isActive'] = true;
            }
            logger_1.logger.info('Getting user statistics', { filter });
            const [totalUsers, activeUsers, lockedUsers, superAdmins, recentUsers] = await Promise.all([
                this.userService.count(filter),
                this.userService.count({ ...filter, isActive: true }),
                this.userService.count({ ...filter, 'security.isLocked': true }),
                this.userService.count({ ...filter, isSuperAdmin: true }),
                this.userService.count({
                    ...filter,
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                })
            ]);
            const stats = {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                lockedUsers,
                superAdmins,
                recentUsers,
                activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
            };
            this.sendSuccess(res, stats, 'User statistics retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map