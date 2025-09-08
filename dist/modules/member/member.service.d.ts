import { UpdateMemberDto } from './dto/update-member.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { FinanceService } from '../finance/finance.service';
import { JsonServerService } from '../../services/json-server.service';
export declare class MemberService {
    private readonly transactionService;
    private readonly financeService;
    private readonly jsonServerService;
    constructor(transactionService: TransactionsService, financeService: FinanceService, jsonServerService: JsonServerService);
    getDashboard(req: {
        user: {
            id: string | number;
            currently_at: string | number;
        };
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                totalSpent: any;
                totalAllowance: any;
                remainingAllowance: number;
                pendingApprovals: number;
            };
            clubs: {
                id: any;
                name: any;
                location: any;
                isActive: boolean;
            }[];
            pendingTransactions: {
                transactionId: any;
                amount: any;
                category: any;
                userName: any;
            }[];
            transactions: any[];
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: null;
        error: any;
    }>;
    switchClub(clubId: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: null;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            currentClub: {
                id: any;
                name: any;
                location: any;
            };
            user: any;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: null;
        error: any;
    }>;
    getMemberDashboardSummary(req: any, period: string): Promise<{
        success: boolean;
        message: string;
        data: {
            totalSpent: number;
        };
    }>;
    private getPeriodDateRange;
    private isInPeriod;
    private calculateTotalSpent;
    private filterTransactionsByPeriod;
    findOne(id: number): string;
    update(id: number, updateMemberDto: UpdateMemberDto): string;
    remove(id: number): string;
}
