import { BaseService } from './BaseService';
import { IRole } from '../types/models';
export declare class RoleService extends BaseService<IRole> {
    constructor();
    createRole(roleData: Partial<IRole>, createdBy?: string): Promise<IRole>;
    getRoleByName(roleName: string, companyId: string): Promise<IRole | null>;
    getRolesByCompany(companyId: string, options?: any): Promise<IRole[]>;
    updateRolePermissions(roleId: string, permissions: string[], updatedBy?: string): Promise<IRole | null>;
    hasPermission(roleId: string, permission: string): Promise<boolean>;
    getUsersWithRole(roleId: string): Promise<any[]>;
    cloneRole(roleId: string, newRoleName: string, clonedBy?: string): Promise<IRole>;
    getRoleStats(companyId: string): Promise<any>;
    private validateRoleData;
}
//# sourceMappingURL=RoleService.d.ts.map