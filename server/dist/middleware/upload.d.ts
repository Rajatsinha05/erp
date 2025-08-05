import { Request } from 'express';
export declare const uploadSingle: (fieldName: string, folder?: string) => (req: Request, res: any, next: any) => void;
export declare const uploadMultiple: (fieldName: string, maxCount?: number, folder?: string) => (req: Request, res: any, next: any) => void;
export declare const uploadFields: (fields: {
    name: string;
    maxCount: number;
}[], folder?: string) => (req: Request, res: any, next: any) => void;
export declare const uploadVisitorFiles: (req: Request, res: any, next: any) => void;
export declare const uploadProfilePhoto: (req: Request, res: any, next: any) => void;
export declare const uploadDocument: (req: Request, res: any, next: any) => void;
export declare const uploadFile: (req: Request, res: any, next: any) => void;
export declare const setUploadFolder: (folder: string) => (req: Request, res: any, next: any) => void;
export declare const validateUploadedFiles: (req: Request, res: any, next: any) => any;
declare const _default: {
    uploadSingle: (fieldName: string, folder?: string) => (req: Request, res: any, next: any) => void;
    uploadMultiple: (fieldName: string, maxCount?: number, folder?: string) => (req: Request, res: any, next: any) => void;
    uploadFields: (fields: {
        name: string;
        maxCount: number;
    }[], folder?: string) => (req: Request, res: any, next: any) => void;
    uploadVisitorFiles: (req: Request, res: any, next: any) => void;
    uploadProfilePhoto: (req: Request, res: any, next: any) => void;
    uploadDocument: (req: Request, res: any, next: any) => void;
    uploadFile: (req: Request, res: any, next: any) => void;
    setUploadFolder: (folder: string) => (req: Request, res: any, next: any) => void;
    validateUploadedFiles: (req: Request, res: any, next: any) => any;
};
export default _default;
//# sourceMappingURL=upload.d.ts.map