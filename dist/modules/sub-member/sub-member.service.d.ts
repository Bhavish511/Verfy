import { CreateSubMemberDto } from './dto/create-sub-member.dto';
import { JsonServerService } from '../../services/json-server.service';
import { TransactionsService } from '../transactions/transactions.service';
export declare class SubMemberService {
    private readonly jsonServerService;
    private readonly transactionService;
    constructor(jsonServerService: JsonServerService, transactionService: TransactionsService);
    private readonly logger;
    fields: {
        roles: string;
    };
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
    createSubMember(createSubMemberDto: CreateSubMemberDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            subMember: any;
            invitationCode: any;
            expiresAt: any;
            clubsAdded: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllSubMembers(req: any): Promise<{
        success: boolean;
        data: {
            users: any[];
        };
    }>;
    removeSubMember(id: string): Promise<{
        success: boolean;
        message: string;
        subMember: any;
    }>;
    editAllowance(req: any, userId: string, allowance: number): Promise<{
        success: boolean;
        message: string;
        data: {
            userClub: any;
        };
    } | {
        success: boolean;
        message: any;
        data: null;
    }>;
    getsubDashboard(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                totalSpent: number;
                totalAllowance: number;
                remainingAllowance: number;
            };
            clubs: any[];
            twoRecentTransactions: {
                transactionId: any;
                amount: number;
                category: any;
                userName: any;
            }[];
            transactions: any[];
            user: {
                id: any;
                fullname: any;
                email: any;
                profilePic: any;
                relation: any;
                allowance: number;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: null;
        error: any;
    }>;
    getDashboard(req: {
        user: any;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            summary: {
                totalSpent: number;
                totalAllowance: number;
                remainingAllowance: number;
            };
            clubs: {
                id: any;
                name: any;
                location: any;
                isActive: boolean;
            }[];
            twoRecentTransactions: {
                transactionId: any;
                amount: number;
                category: any;
                userName: any;
            }[];
            transactions: any[];
            user: {
                id: any;
                fullname: any;
                email: any;
                relation: any;
                allowance: number;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: null;
        error: any;
    }>;
    validateInvitationCode(invitationCode: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getSubMemberDashboardSummary(req: any, period: string): Promise<{
        success: boolean;
        message: string;
        data: {
            totalSpent: number;
            totalAllowance: number;
            remainingAllowance: number;
        };
    }>;
    private getPeriodDateRange;
    private isInPeriod;
    private calculateTotalSpent;
}
