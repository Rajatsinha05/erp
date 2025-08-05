declare class DatabaseManager {
    private static instance;
    private isConnected;
    private connectionRetries;
    private maxRetries;
    private retryDelay;
    private constructor();
    static getInstance(): DatabaseManager;
    private getConnectionConfig;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private setupEventListeners;
    private setupIndexes;
    getConnectionStatus(): {
        isConnected: boolean;
        readyState: number;
        host?: string;
        port?: number;
        database?: string;
    };
    healthCheck(): Promise<boolean>;
    getStats(): Promise<any>;
}
declare const _default: DatabaseManager;
export default _default;
//# sourceMappingURL=database.d.ts.map