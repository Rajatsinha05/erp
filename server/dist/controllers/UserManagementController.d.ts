import { Request, Response } from 'express';
export declare class UserManagementController {
    static getAllUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=UserManagementController.d.ts.map