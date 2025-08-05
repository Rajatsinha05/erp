import { Router } from 'express';
import { RoleController } from '../../controllers/RoleController';
import { authenticate } from '../../middleware/auth';

const router = Router();
const roleController = new RoleController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/v2/roles
 * @desc    Create a new role
 * @access  Private
 */
router.post('/', roleController.createRole.bind(roleController));

/**
 * @route   GET /api/v2/roles
 * @desc    Get roles by company with pagination and filters
 * @access  Private
 */
router.get('/', roleController.getRolesByCompany.bind(roleController));

/**
 * @route   GET /api/v2/roles/search
 * @desc    Search roles
 * @access  Private
 */
router.get('/search', roleController.searchRoles.bind(roleController));

/**
 * @route   GET /api/v2/roles/stats
 * @desc    Get role statistics
 * @access  Private
 */
router.get('/stats', roleController.getRoleStats.bind(roleController));

/**
 * @route   GET /api/v2/roles/name/:roleName
 * @desc    Get role by name
 * @access  Private
 */
router.get('/name/:roleName', roleController.getRoleByName.bind(roleController));

/**
 * @route   GET /api/v2/roles/:id
 * @desc    Get role by ID
 * @access  Private
 */
router.get('/:id', roleController.getRoleById.bind(roleController));

/**
 * @route   PUT /api/v2/roles/:id
 * @desc    Update role
 * @access  Private
 */
router.put('/:id', roleController.updateRole.bind(roleController));

/**
 * @route   PUT /api/v2/roles/:roleId/permissions
 * @desc    Update role permissions
 * @access  Private
 */
router.put('/:roleId/permissions', roleController.updateRolePermissions.bind(roleController));

/**
 * @route   GET /api/v2/roles/:roleId/check-permission
 * @desc    Check if role has specific permission
 * @access  Private
 */
router.get('/:roleId/check-permission', roleController.checkPermission.bind(roleController));

/**
 * @route   POST /api/v2/roles/:roleId/clone
 * @desc    Clone role
 * @access  Private
 */
router.post('/:roleId/clone', roleController.cloneRole.bind(roleController));

/**
 * @route   DELETE /api/v2/roles/:id
 * @desc    Delete role (soft delete)
 * @access  Private
 */
router.delete('/:id', roleController.deleteRole.bind(roleController));

export default router;
