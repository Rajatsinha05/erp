import { BaseService } from './BaseService';
import { IUser } from '@/types/models';
export declare class UserService extends BaseService<IUser> {
    constructor();
    createUser(userData: Partial<IUser>, createdBy?: string): Promise<IUser>;
    findByUsernameOrEmail(identifier: string): Promise<IUser | null>;
    authenticateUser(identifier: string, password: string): Promise<IUser | null>;
    addCompanyAccess(userId: string, companyId: string, role: string, permissions?: any, assignedBy?: string): Promise<IUser | null>;
    removeCompanyAccess(userId: string, companyId: string, removedBy?: string): Promise<IUser | null>;
    updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;
    resetPassword(userId: string, newPassword: string, resetBy?: string): Promise<string>;
    toggleAccountLock(userId: string, isLocked: boolean, actionBy?: string): Promise<IUser | null>;
    getUsersByCompany(companyId: string, page?: number, limit?: number): Promise<{
        documents: IUser[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextPage: number;
            prevPage: number;
        };
    }>;
    searchUsers(searchTerm: string, companyId?: string, page?: number, limit?: number): Promise<{
        documents: IUser[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextPage: number;
            prevPage: number;
        };
    }>;
    private incrementLoginAttempts;
    private resetLoginAttempts;
    private generateTemporaryPassword;
    private validateUserData;
}
//# sourceMappingURL=UserService.d.ts.map