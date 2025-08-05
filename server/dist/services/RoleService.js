"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const mongoose_1 = require("mongoose");
const BaseService_1 = require("./BaseService");
const models_1 = require("../models");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class RoleService extends BaseService_1.BaseService {
    constructor() {
        super(models_1.Role);
    }
    async createRole(roleData, createdBy) {
        try {
            this.validateRoleData(roleData);
            const existingRole = await this.findOne({
                roleName: roleData.roleName,
                companyId: roleData.companyId
            });
            if (existingRole) {
                throw new errors_1.AppError('Role name already exists', 400);
            }
            const role = await this.create({
                ...roleData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, createdBy);
            logger_1.logger.info('Role created successfully', {
                roleId: role._id,
                roleName: role.roleName,
                companyId: roleData.companyId,
                createdBy
            });
            return role;
        }
        catch (error) {
            logger_1.logger.error('Error creating role', { error, roleData, createdBy });
            throw error;
        }
    }
    async getRoleByName(roleName, companyId) {
        try {
            return await this.findOne({
                roleName,
                companyId: new mongoose_1.Types.ObjectId(companyId)
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting role by name', { error, roleName, companyId });
            throw error;
        }
    }
    async getRolesByCompany(companyId, options = {}) {
        try {
            const query = {
                companyId: new mongoose_1.Types.ObjectId(companyId),
                isActive: true
            };
            return await this.findMany(query, options);
        }
        catch (error) {
            logger_1.logger.error('Error getting roles by company', { error, companyId });
            throw error;
        }
    }
    async updateRolePermissions(roleId, permissions, updatedBy) {
        try {
            const role = await this.findById(roleId);
            if (!role) {
                throw new errors_1.AppError('Role not found', 404);
            }
            const updatedRole = await this.update(roleId, {
                permissions,
                lastPermissionUpdate: new Date()
            }, updatedBy);
            logger_1.logger.info('Role permissions updated', {
                roleId,
                permissions: permissions.length,
                updatedBy
            });
            return updatedRole;
        }
        catch (error) {
            logger_1.logger.error('Error updating role permissions', { error, roleId, permissions, updatedBy });
            throw error;
        }
    }
    async hasPermission(roleId, permission) {
        try {
            const role = await this.findById(roleId);
            if (!role || !role.isActive) {
                return false;
            }
            const permissionCategories = Object.values(role.permissions);
            return permissionCategories.some(category => typeof category === 'object' && category !== null &&
                Object.values(category).some(perm => typeof perm === 'object' && perm !== null &&
                    Object.values(perm).includes(true)));
        }
        catch (error) {
            logger_1.logger.error('Error checking role permission', { error, roleId, permission });
            return false;
        }
    }
    async getUsersWithRole(roleId) {
        try {
            return [];
        }
        catch (error) {
            logger_1.logger.error('Error getting users with role', { error, roleId });
            throw error;
        }
    }
    async cloneRole(roleId, newRoleName, clonedBy) {
        try {
            const originalRole = await this.findById(roleId);
            if (!originalRole) {
                throw new errors_1.AppError('Original role not found', 404);
            }
            const existingRole = await this.findOne({
                roleName: newRoleName,
                companyId: originalRole.companyId
            });
            if (existingRole) {
                throw new errors_1.AppError('Role name already exists', 400);
            }
            const clonedRole = await this.create({
                companyId: originalRole.companyId,
                roleName: newRoleName,
                description: `Cloned from ${originalRole.roleName}`,
                permissions: { ...originalRole.permissions },
                roleType: originalRole.roleType,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }, clonedBy);
            logger_1.logger.info('Role cloned successfully', {
                originalRoleId: roleId,
                clonedRoleId: clonedRole._id,
                newRoleName,
                clonedBy
            });
            return clonedRole;
        }
        catch (error) {
            logger_1.logger.error('Error cloning role', { error, roleId, newRoleName, clonedBy });
            throw error;
        }
    }
    async getRoleStats(companyId) {
        try {
            const [totalRoles, activeRoles, rolesByType, rolesWithUsers] = await Promise.all([
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId) }),
                this.count({ companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true }),
                this.model.aggregate([
                    { $match: { companyId: new mongoose_1.Types.ObjectId(companyId), isActive: true } },
                    { $group: { _id: '$roleType', count: { $sum: 1 } } }
                ]),
                Promise.resolve([])
            ]);
            return {
                totalRoles,
                activeRoles,
                rolesByType,
                rolesWithUsers: rolesWithUsers.length
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting role statistics', { error, companyId });
            throw error;
        }
    }
    validateRoleData(roleData) {
        if (!roleData.companyId) {
            throw new errors_1.AppError('Company ID is required', 400);
        }
        if (!roleData.roleName) {
            throw new errors_1.AppError('Role name is required', 400);
        }
        if (!roleData.permissions || Object.keys(roleData.permissions).length === 0) {
            throw new errors_1.AppError('At least one permission is required', 400);
        }
        if (!roleData.roleType) {
            throw new errors_1.AppError('Role type is required', 400);
        }
        const validRoleTypes = ['system', 'custom', 'department'];
        if (!validRoleTypes.includes(roleData.roleType)) {
            throw new errors_1.AppError('Invalid role type', 400);
        }
    }
}
exports.RoleService = RoleService;
//# sourceMappingURL=RoleService.js.map