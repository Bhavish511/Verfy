import { MemberService } from './member.service';
import { UpdateMemberDto } from './dto/update-member.dto';
export declare class MemberController {
    private readonly memberService;
    constructor(memberService: MemberService);
    getDashboard(req: any): Promise<{
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
    getAllNotifications(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            notifications: any[];
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getDashboardSummary(req: any, period: string): Promise<{
        success: boolean;
        message: string;
        data: {
            totalSpent: number;
        };
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
    findOne(id: string): string;
    update(id: string, updateMemberDto: UpdateMemberDto): string;
    remove(id: string): string;
}
