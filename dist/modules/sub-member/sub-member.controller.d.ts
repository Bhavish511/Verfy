import { SubMemberService } from './sub-member.service';
import { CreateSubMemberDto } from './dto/create-sub-member.dto';
export declare class SubMemberController {
    private readonly subMemberService;
    constructor(subMemberService: SubMemberService);
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
    removeSubMember(id: string): Promise<{
        success: boolean;
        message: string;
        subMember: any;
    }>;
    editAllowance(id: string, body: {
        allowance: number;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            finance: any;
        };
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
            finance: any;
            user: {
                id: any;
                fullname: any;
                email: any;
                relation: any;
                allowance: any;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: null;
        error: any;
    }>;
    getDashboard(req: any): Promise<{
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
            finance: any;
            user: {
                id: any;
                fullname: any;
                email: any;
                relation: any;
                allowance: any;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: null;
        error: any;
    }>;
    getDashboardView(req: any, view: string): Promise<{
        success: boolean;
        message: string;
        data: {
            totalSpent: number;
        };
    }>;
    findAllSubMembers(req: any): Promise<{
        success: boolean;
        data: {
            users: any[];
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
    validateInvitationCode(body: {
        invitationCode: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
