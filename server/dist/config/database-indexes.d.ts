export interface IndexConfig {
    collection: string;
    indexes: Array<{
        fields: Record<string, 1 | -1 | 'text'>;
        options?: {
            unique?: boolean;
            sparse?: boolean;
            background?: boolean;
            name?: string;
            partialFilterExpression?: any;
        };
        description: string;
    }>;
}
export declare const DATABASE_INDEXES: IndexConfig[];
export declare function createDatabaseIndexes(): Promise<void>;
export declare function dropAllIndexes(): Promise<void>;
//# sourceMappingURL=database-indexes.d.ts.map