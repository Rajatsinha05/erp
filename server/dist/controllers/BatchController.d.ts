import { Request, Response } from 'express';
export declare class BatchController {
    private sendError;
    getAllBatches(req: Request, res: Response): Promise<void>;
    getBatchById(req: Request, res: Response): Promise<void>;
    createBatch(req: Request, res: Response): Promise<void>;
    updateBatch(req: Request, res: Response): Promise<void>;
    getBatchSummaryByStage(req: Request, res: Response): Promise<void>;
    updateProcessStage(req: Request, res: Response): Promise<void>;
    private updateItemStock;
}
//# sourceMappingURL=BatchController.d.ts.map