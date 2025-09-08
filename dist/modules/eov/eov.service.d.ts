import { StreamableFile } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JsonServerService } from '../../services/json-server.service';
type Transaction = {
    id: string;
    clubId: number | string;
    bill: number;
    userId: number | string;
    memberId?: number | string;
    category: string;
    status: 'approved' | 'refused' | 'pending';
    verifyCharge: boolean;
    flagChargeId: string | number | boolean | null;
    createdAt?: string;
    date?: string;
    updatedAt?: string;
};
export declare class EovService {
    private readonly http;
    private readonly jsonServerService;
    private readonly api;
    constructor(http: HttpService, jsonServerService: JsonServerService);
    getDashboard(memberId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            flaggedChargeCount: number;
            totalSpending: any;
            totalAllowance: any;
            flaggedTransactions: any[];
        };
    }>;
    getSummaryReport(memberId: string, period?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            period: {
                name: string;
                startDate: string;
                endDate: string;
            };
            summary: {
                totalTransactions: number;
                totalSpending: number;
                totalAllowance: number;
                flaggedChargeCount: number;
                flaggedTransactions: number;
            };
            breakdown: {
                categories: Record<string, number>;
                status: Record<string, number>;
                timeBased: {
                    date: string;
                    transactions: number;
                    totalSpent: number;
                    categories: Record<string, number>;
                    status: Record<string, number>;
                    flaggedCount: number;
                }[];
            };
            verifiedSpends: {
                count: number;
                totalAmount: number;
                transactions: Transaction[];
            };
            flaggedCharges: {
                count: number;
                totalAmount: number;
                transactions: Transaction[];
            };
            clubAndMemberBreakdown: {
                club: {
                    id: string | number | null | undefined;
                    name: string;
                    location: string;
                };
                member: {
                    id: string | number;
                    fullname: string | undefined;
                    email: string | undefined;
                    roles: string | undefined;
                    finance: {
                        totalAllowance: number;
                        totalSpent: number;
                        remainingAllowance: number;
                    };
                    transactions: {
                        count: number;
                        totalSpent: number;
                        verified: number;
                        flagged: number;
                    };
                };
                subMembers: {
                    subMember: {
                        id: string | number;
                        fullname: string | undefined;
                        email: string | undefined;
                        roles: string | undefined;
                    };
                    finance: {
                        totalAllowance: number;
                        totalSpent: number;
                        remainingAllowance: number;
                    };
                    transactions: {
                        count: number;
                        totalSpent: number;
                        verified: number;
                        flagged: number;
                    };
                }[];
                totals: {
                    totalAllowance: number;
                    totalSpent: number;
                    totalTransactions: number;
                    totalVerified: number;
                    totalFlagged: number;
                };
            } | {
                club: {
                    id: string;
                    name: string;
                    location: string;
                };
                member: {
                    id: string | number;
                    fullname: string | undefined;
                    email: string | undefined;
                    roles: string | undefined;
                    finance?: undefined;
                    transactions?: undefined;
                };
                subMembers: never[];
                totals: {
                    totalAllowance: number;
                    totalSpent: number;
                    totalTransactions: number;
                    totalVerified: number;
                    totalFlagged: number;
                };
            };
            subMembers: {
                id: string | number;
                fullname: string | undefined;
                email: string | undefined;
            }[];
        };
    }>;
    sendEmailReport(memberId: string, period?: string, autoSend?: boolean): Promise<{
        success: boolean;
        message: string;
        data: {
            recipient: string;
            period: {
                name: string;
                startDate: string;
                endDate: string;
            };
            sentAt: string;
            emailId: string;
            autoSent: boolean;
            emailContent?: undefined;
            note?: undefined;
        };
    } | {
        success: boolean;
        message: string;
        data: {
            recipient: string;
            period: {
                name: string;
                startDate: string;
                endDate: string;
            };
            emailContent: string;
            autoSent: boolean;
            note: string;
            sentAt?: undefined;
            emailId?: undefined;
        };
    }>;
    fetchAndGenerateReport(memberId: string, period?: string): Promise<StreamableFile>;
    private filterTransactionsByPeriod;
    private calculateTotalAllowance;
    private calculateCategoryBreakdown;
    private calculateStatusBreakdown;
    private getClubAndMemberBreakdown;
    private calculateTimeBreakdown;
    private generateEmailContent;
    private sendEmail;
    private generatePDFReport;
    private fetchUser;
    private fetchSubMembersForMember;
    private fetchClub;
    private fetchFinance;
    private fetchTransactionsForClub;
    private fetchFlagChargesForMember;
}
export {};
