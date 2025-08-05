"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const BaseController_1 = require("./BaseController");
const RoleService_1 = require("../services/RoleService");
class RoleController extends BaseController_1.BaseController {
    roleService;
    constructor() {
        const roleService = new RoleService_1.RoleService();
        super(roleService, 'Role');
        this.roleService = roleService;
    }
    async createRole(req, res) {
        try {
            const roleData = req.body;
            const createdBy = req.user?.id;
            const role = await this.roleService.createRole(roleData, createdBy);
            this.sendSuccess(res, role, 'Role created successfully', 201);
        }
        catch (error) {
            this.sendError(res, error, 'Failed to create role');
        }
    }
    async getRoleByName(req, res) {
        try {
            const { roleName } = req.params;
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const role = await this.roleService.getRoleByName(roleName, companyId.toString());
            if (!role) {
                this.sendError(res, new Error('Role not found'), 'Role not found', 404);
                return;
            }
            this.sendSuccess(res, role, 'Role retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get role');
        }
    }
    async getRolesByCompany(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { page = 1, limit = 10, search, roleType } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const options = {
                page: parseInt(page),
                limit: parseInt(limit)
            };
            if (search) {
                options.search = search;
            }
            if (roleType) {
                options.roleType = roleType;
            }
            const roles = await this.roleService.getRolesByCompany(companyId.toString(), options);
            this.sendSuccess(res, roles, 'Roles retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get roles');
        }
    }
    async updateRolePermissions(req, res) {
        try {
            const { roleId } = req.params;
            const { permissions } = req.body;
            const updatedBy = req.user?.id;
            const role = await this.roleService.updateRolePermissions(roleId, permissions, updatedBy);
            this.sendSuccess(res, role, 'Role permissions updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update role permissions');
        }
    }
    async checkPermission(req, res) {
        try {
            const { roleId } = req.params;
            const { permission } = req.query;
            if (!permission) {
                this.sendError(res, new Error('Permission is required'), 'Permission is required', 400);
                return;
            }
            const hasPermission = await this.roleService.hasPermission(roleId, permission);
            this.sendSuccess(res, { hasPermission }, 'Permission check completed');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to check permission');
        }
    }
    async cloneRole(req, res) {
        try {
            const { roleId } = req.params;
            const { newRoleName } = req.body;
            const clonedBy = req.user?.id;
            const clonedRole = await this.roleService.cloneRole(roleId, newRoleName, clonedBy);
            this.sendSuccess(res, clonedRole, 'Role cloned successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to clone role');
        }
    }
    async getRoleStats(req, res) {
        try {
            const companyId = req.user?.companyId;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            const stats = await this.roleService.getRoleStats(companyId.toString());
            this.sendSuccess(res, stats, 'Role statistics retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get role statistics');
        }
    }
    async updateRole(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBy = req.user?.id;
            const role = await this.roleService.update(id, updateData, updatedBy);
            if (!role) {
                this.sendError(res, new Error('Role not found'), 'Role not found', 404);
                return;
            }
            this.sendSuccess(res, role, 'Role updated successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to update role');
        }
    }
    async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const role = await this.roleService.findById(id);
            if (!role) {
                this.sendError(res, new Error('Role not found'), 'Role not found', 404);
                return;
            }
            this.sendSuccess(res, role, 'Role retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to get role');
        }
    }
    async deleteRole(req, res) {
        try {
            const { id } = req.params;
            const deletedBy = req.user?.id;
            const role = await this.roleService.update(id, {
                isActive: false,
                deletedAt: new Date()
            }, deletedBy);
            if (!role) {
                this.sendError(res, new Error('Role not found'), 'Role not found', 404);
                return;
            }
            this.sendSuccess(res, null, 'Role deleted successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to delete role');
        }
    }
    async searchRoles(req, res) {
        try {
            const companyId = req.user?.companyId;
            const { q: searchTerm, limit = 10 } = req.query;
            if (!companyId) {
                this.sendError(res, new Error('Company ID is required'), 'Company ID is required', 400);
                return;
            }
            if (!searchTerm) {
                this.sendError(res, new Error('Search term is required'), 'Search term is required', 400);
                return;
            }
            const roles = await this.roleService.findMany({
                companyId,
                $or: [
                    { roleName: { $regex: searchTerm, $options: 'i' } },
                    { displayName: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ],
                isActive: true
            }, { limit: parseInt(limit) });
            this.sendSuccess(res, roles, 'Search results retrieved successfully');
        }
        catch (error) {
            this.sendError(res, error, 'Failed to search roles');
        }
    }
}
exports.RoleController = RoleController;
//# sourceMappingURL=RoleController.js.map