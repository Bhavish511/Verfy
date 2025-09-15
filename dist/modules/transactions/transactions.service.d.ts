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
    create({ category, bill }: CreateTransactionDto, clubId: string | number, req: any): Promise<{
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
            transactions: Tx[];
            pendingCharges: Tx[];
            pendingApprovals: number;
        };
    }>;
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
    getfilertedTransactionFeed(req: any, filters?: any): Promise<any>;
    verifyCharge(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    remove(id: number): string;
}
export {};
