import { BaseService } from './BaseService';
import { ICompany } from '@/types/models';
export declare class CompanyService extends BaseService<ICompany> {
    constructor();
    createCompany(companyData: Partial<ICompany>, userId?: string): Promise<ICompany>;
    findByCode(companyCode: string): Promise<ICompany | null>;
    getActiveCompanies(page?: number, limit?: number): Promise<{
        documents: ICompany[];
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
    updateSettings(companyId: string, settings: any, userId?: string): Promise<ICompany | null>;
    addBranch(companyId: string, branchData: any, userId?: string): Promise<ICompany | null>;
    getCompanyStats(companyId: string): Promise<{
        companyCode: string;
        companyName: string;
        legalName: string;
        gstin: string;
        pan: string;
        currency: string;
        timezone: string;
        totalBankAccounts: number;
        activeBankAccounts: number;
        totalLicenses: number;
        isActive: boolean;
    }>;
    searchCompanies(searchTerm: string, page?: number, limit?: number): Promise<{
        documents: ICompany[];
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
    deactivateCompany(companyId: string, userId?: string): Promise<boolean>;
    reactivateCompany(companyId: string, userId?: string): Promise<boolean>;
    private generateCompanyCode;
    private validateCompanyData;
}
//# sourceMappingURL=CompanyService.d.ts.map