import { FilterQuery, QueryOptions, PipelineStage } from 'mongoose';
export interface OptimizedQueryOptions extends QueryOptions {
    useCache?: boolean;
    cacheTTL?: number;
    lean?: boolean;
    explain?: boolean;
}
export declare class QueryOptimizer {
    static optimizeFindOptions(options?: OptimizedQueryOptions): QueryOptions;
    static optimizeAggregationPipeline(pipeline: PipelineStage[]): PipelineStage[];
    static createCompanyFilter<T>(companyId: string, additionalFilter?: FilterQuery<T>): FilterQuery<T>;
    static createDateRangeFilter(field?: string, startDate?: Date, endDate?: Date): FilterQuery<any>;
    static createPaginationOptions(page?: number, limit?: number): QueryOptions;
    static createTextSearchFilter(searchTerm: string, fields: string[]): FilterQuery<any>;
    static createStatusFilter(status?: string | string[]): FilterQuery<any>;
    static createStatsAggregation(matchFilter: FilterQuery<any>, groupBy?: string, sumField?: string): PipelineStage[];
    static createLookupStage(from: string, localField: string, foreignField: string, as: string, pipeline?: PipelineStage[]): PipelineStage;
    static logQueryPerformance(operation: string, startTime: number, resultCount?: number, filter?: any): void;
    static sanitizeFilter(filter: any): FilterQuery<any>;
    static createCountAggregation(matchFilter: FilterQuery<any>): PipelineStage[];
    static createFacetedAggregation(matchFilter: FilterQuery<any>, facets: Record<string, any[]>): PipelineStage[];
}
export default QueryOptimizer;
//# sourceMappingURL=query-optimizer.d.ts.map