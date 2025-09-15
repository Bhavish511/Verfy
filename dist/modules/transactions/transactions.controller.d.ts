import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(dto: CreateTransactionDto, id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            expense: any;
            userClub: any;
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
            transactions: {
                [k: string]: any;
                id: string | number;
                clubId: string | number;
                userId: string | number;
                memberId?: string | number;
                bill: number | string;
                category: string;
                status?: "pending" | "approved" | "refused";
                verifyCharge?: boolean;
                description?: string;
                date?: string;
                createdAt?: string;
                updatedAt?: string;
            }[];
            pendingCharges: {
                [k: string]: any;
                id: string | number;
                clubId: string | number;
                userId: string | number;
                memberId?: string | number;
                bill: number | string;
                category: string;
                status?: "pending" | "approved" | "refused";
                verifyCharge?: boolean;
                description?: string;
                date?: string;
                createdAt?: string;
                updatedAt?: string;
            }[];
            pendingApprovals: number;
        };
    }>;
    getTransactionFeed(req: any, status?: string, categoryRaw?: string | string[], subMemberId?: string, dateRange?: string, fromDate?: string, toDate?: string): Promise<any>;
    getCategories(req: any): Promise<{
        success: boolean;
        message: string;
        data: string[];
    }>;
    update(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
