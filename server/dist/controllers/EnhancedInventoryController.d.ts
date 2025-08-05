import { Request, Response } from 'express';
export declare class EnhancedInventoryController {
    private sendError;
    getInventorySummary(req: Request, res: Response): Promise<void>;
    getProductSummary(req: Request, res: Response): Promise<void>;
    getLocationWiseInventory(req: Request, res: Response): Promise<void>;
    getAgeingAnalysis(req: Request, res: Response): Promise<void>;
    advancedSearch(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=EnhancedInventoryController.d.ts.map