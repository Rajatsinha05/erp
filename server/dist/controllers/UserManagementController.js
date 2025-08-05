"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
const User_1 = __importDefault(require("../models/User"));
const Company_1 = __importDefault(require("../models/Company"));
const logger_1 = __importDefault(require("../utils/logger"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
class UserManagementController {
    static async getAllUsers(req, res) {
        try {
            const user = req.user;
            if (!user.isSuperAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin privileges required.'
                });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const role = req.query.role || '';
            const companyId = req.query.companyId || '';
            const filter = {};
            if (search) {
                filter.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ];
            }
            if (companyId) {
                filter['companyAccess.companyId'] = new mongoose_1.default.Types.ObjectId(companyId);
            }
            if (role) {
                filter['companyAccess.role'] = role;
            }
            const skip = (page - 1) * limit;
            const users = await User_1.default.find(filter)
                .populate('companyAccess.companyId', 'companyName companyCode')
                .populate('primaryCompanyId', 'companyName companyCode')
                .select('-password -security.twoFactorSecret')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await User_1.default.countDocuments(filter);
            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        }
        catch (error) {
            logger_1.default.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users'
            });
        }
    }
    static async createUser(req, res) {
        try {
            const user = req.user;
            if (!user.isSuperAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin privileges required.'
                });
            }
            const { username, email, password, firstName, lastName, phone, companyId, role, department, designation, employeeId, permissions } = req.body;
            if (!username || !email || !password || !companyId || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, email, password, company, and role are required'
                });
            }
            const existingUser = await User_1.default.findOne({
                $or: [{ email }, { username }]
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email or username already exists'
                });
            }
            const company = await Company_1.default.findById(companyId);
            if (!company) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid company ID'
                });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const newUser = new User_1.default({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                primaryCompanyId: companyId,
                companyAccess: [{
                        companyId,
                        role,
                        department,
                        designation,
                        employeeId,
                        isActive: true,
                        permissions: permissions || {
                            inventory: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false },
                            production: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false },
                            orders: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false },
                            financial: { view: false, create: false, edit: false, delete: false, approve: false, viewReports: false },
                            security: { gateManagement: false, visitorManagement: false, vehicleTracking: false, cctvAccess: false, emergencyResponse: false, securityReports: false, incidentManagement: false, accessControl: false, patrolManagement: false },
                            hr: { viewEmployees: false, manageEmployees: false, manageAttendance: false, manageSalary: false, manageLeaves: false, viewReports: false, recruitment: false, performance: false, training: false, disciplinary: false },
                            admin: { userManagement: false, systemSettings: false, backupRestore: false, auditLogs: false }
                        },
                        joinedAt: new Date()
                    }],
                isActive: true,
                createdAt: new Date()
            });
            await newUser.save();
            const userResponse = newUser.toObject();
            delete userResponse.password;
            logger_1.default.info('User created by SuperAdmin', {
                createdUserId: newUser._id,
                createdUserEmail: email,
                createdBy: user._id,
                companyId
            });
            res.status(201).json({
                success: true,
                data: userResponse,
                message: 'User created successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Create user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create user'
            });
        }
    }
    static async updateUser(req, res) {
        try {
            const user = req.user;
            if (!user.isSuperAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin privileges required.'
                });
            }
            const { userId } = req.params;
            const updateData = req.body;
            delete updateData.password;
            const updatedUser = await User_1.default.findByIdAndUpdate(userId, { ...updateData, updatedAt: new Date() }, { new: true, runValidators: true }).populate('companyAccess.companyId', 'companyName companyCode')
                .populate('primaryCompanyId', 'companyName companyCode')
                .select('-password');
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            logger_1.default.info('User updated by SuperAdmin', {
                updatedUserId: userId,
                updatedBy: user._id
            });
            res.json({
                success: true,
                data: updatedUser,
                message: 'User updated successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }
    }
    static async deleteUser(req, res) {
        try {
            const user = req.user;
            if (!user.isSuperAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin privileges required.'
                });
            }
            const { userId } = req.params;
            if (userId === user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
            }
            const deletedUser = await User_1.default.findByIdAndDelete(userId);
            if (!deletedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            logger_1.default.info('User deleted by SuperAdmin', {
                deletedUserId: userId,
                deletedUserEmail: deletedUser.email,
                deletedBy: user._id
            });
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        }
        catch (error) {
            logger_1.default.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }
    }
    static async getUserById(req, res) {
        try {
            const user = req.user;
            if (!user.isSuperAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. SuperAdmin privileges required.'
                });
            }
            const { userId } = req.params;
            const foundUser = await User_1.default.findById(userId)
                .populate('companyAccess.companyId', 'companyName companyCode')
                .populate('primaryCompanyId', 'companyName companyCode')
                .select('-password');
            if (!foundUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                data: foundUser
            });
        }
        catch (error) {
            logger_1.default.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user'
            });
        }
    }
}
exports.UserManagementController = UserManagementController;
//# sourceMappingURL=UserManagementController.js.map