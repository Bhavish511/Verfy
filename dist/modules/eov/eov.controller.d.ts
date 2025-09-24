import { EovService } from './eov.service';
export declare class EovController {
    private readonly eovService;
    constructor(eovService: EovService);
    getDashboard(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            flaggedChargeCount: number;
            totalSpending: any;
            totalAllowance: any;
            flaggedTransactions: any[];
        };
    }>;
    exportPdf(req: any, period?: string): Promise<{
        success: boolean;
        link?: string;
        message?: string;
    }>;
    sendEmailReport(req: any, body?: {
        period?: string;
        autoSend?: boolean;
    }): Promise<{
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
    getSummary(req: any, period?: string): Promise<{
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
                verifiedtransactions: {
                    id: string;
                    clubId: number | string;
                    bill: number;
                    userId: number | string;
                    memberId?: number | string;
                    category: string;
                    status: "approved" | "refused" | "pending";
                    verifyCharge: boolean;
                    flagChargeId: string | number | boolean | null;
                    createdAt?: string;
                    date?: string;
                    updatedAt?: string;
                }[];
            };
            unverifiedSpends: {
                count: number;
                totalAmount: number;
                Unverifiedtransactions: {
                    id: string;
                    clubId: number | string;
                    bill: number;
                    userId: number | string;
                    memberId?: number | string;
                    category: string;
                    status: "approved" | "refused" | "pending";
                    verifyCharge: boolean;
                    flagChargeId: string | number | boolean | null;
                    createdAt?: string;
                    date?: string;
                    updatedAt?: string;
                }[];
            };
            flaggedCharges: {
                count: number;
                totalAmount: number;
                transactions: {
                    id: string;
                    clubId: number | string;
                    bill: number;
                    userId: number | string;
                    memberId?: number | string;
                    category: string;
                    status: "approved" | "refused" | "pending";
                    verifyCharge: boolean;
                    flagChargeId: string | number | boolean | null;
                    createdAt?: string;
                    date?: string;
                    updatedAt?: string;
                }[];
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
                    clubFinance: {
                        totalAllowance: any;
                        totalSpent: any;
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
                    clubFinance: {
                        totalAllowance: any;
                        totalSpent: any;
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
                    totalAllowance: any;
                    totalSpent: any;
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
                    clubFinance?: undefined;
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
            transactionDetails: {
                id: string;
                clubId: number | string;
                bill: number;
                userId: number | string;
                memberId?: number | string;
                category: string;
                status: "approved" | "refused" | "pending";
                verifyCharge: boolean;
                flagChargeId: string | number | boolean | null;
                createdAt?: string;
                date?: string;
                updatedAt?: string;
            }[];
        };
    }>;
}
