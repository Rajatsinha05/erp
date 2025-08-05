import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { IRole } from '../types/models';
export declare class RoleController extends BaseController<IRole> {
    private roleService;
    constructor();
    createRole(req: Request, res: Response): Promise<void>;
    getRoleByName(req: Request, res: Response): Promise<void>;
    getRolesByCompany(req: Request, res: Response): Promise<void>;
    updateRolePermissions(req: Request, res: Response): Promise<void>;
    checkPermission(req: Request, res: Response): Promise<void>;
    cloneRole(req: Request, res: Response): Promise<void>;
    getRoleStats(req: Request, res: Response): Promise<void>;
    updateRole(req: Request, res: Response): Promise<void>;
    getRoleById(req: Request, res: Response): Promise<void>;
    deleteRole(req: Request, res: Response): Promise<void>;
    searchRoles(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=RoleController.d.ts.map