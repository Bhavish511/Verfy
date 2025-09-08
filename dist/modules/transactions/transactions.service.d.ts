import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JsonServerService } from '../../services/json-server.service';
type Tx = {
    id: string | number;
    clubId: string | number;
    userId: string | number;
    memberId?: string | number;
    bill: number | string;
    category: string;
    status?: 'pending' | 'approved' | 'refused';
    verifyCharge?: boolean;
    description?: string;
    date?: string;
    createdAt?: string;
    updatedAt?: string;
    [k: string]: any;
};
export declare class TransactionsService {
    private readonly jsonServerService;
    constructor(jsonServerService: JsonServerService);
    getCategories(req: any): Promise<{
        success: boolean;
        message: string;
        data: string[];
    }>;
    create({ category, bill }: CreateTransactionDto, id: number, req: any): Promise<{
        success: boolean;
        data: {
            expense: any;
            finance: any;
            transaction: any;
        };
    }>;
    findAllForSubMember(req: any): Promise<{
        data: {
            transactions: any[];
            pendingApprovals: number;
            pendingCharges: any[];
        };
    }>;
    findAllForMember(req: any): Promise<{
        success: boolean;
        data: {
            transactions: Tx[];
            pendingCharges: Tx[];
            pendingApprovals: number;
        };
    }>;
    getTransactionsByCategory(category: string): Promise<any[]>;
    getTransactionFeed(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            transactions: unknown[];
        };
    }>;
    private formatMemberTransactionFeed;
    private formatSubMemberTransactionFeed;
    private groupTransactionsByDay;
    private txTime;
    getfilertedTransactionFeed(req: any, filters?: any): Promise<{
        success: boolean;
        message: string;
        data: {
            transactionsByDay: unknown[];
            totalTransactions: any;
            totalSpent: any;
            filtersApplied: number;
            appliedFilters: string[];
        };
    }>;
    verifyCharge(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    remove(id: number): string;
}
export {};
