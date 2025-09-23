import { JsonServerService } from '../services/json-server.service';
export declare class JsonServerController {
    private readonly jsonServerService;
    private readonly logger;
    constructor(jsonServerService: JsonServerService);
    getUsers(query: any): Promise<any[]>;
    getUser(id: string): Promise<any>;
    createUser(body: any): Promise<any>;
    updateUser(id: string, body: any): Promise<any>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getClubs(query: any): Promise<any[]>;
    getClub(id: string): Promise<any>;
    createClub(body: any): Promise<any>;
    updateClub(id: string, body: any): Promise<any>;
    deleteClub(id: string): Promise<{
        message: string;
    }>;
    getFinances(query: any): Promise<any[]>;
    getFinance(id: string): Promise<any>;
    createFinance(body: any): Promise<any>;
    updateFinance(id: string, body: any): Promise<any>;
    deleteFinance(id: string): Promise<{
        message: string;
    }>;
    getTransactions(query: any): Promise<any[]>;
    getTransaction(id: string): Promise<any>;
    createTransaction(body: any): Promise<any>;
    updateTransaction(id: string, body: any): Promise<any>;
    deleteTransaction(id: string): Promise<{
        message: string;
    }>;
    getFlagCharges(query: any): Promise<any[]>;
    getFlagCharge(id: string): Promise<any>;
    createFlagCharge(body: any): Promise<any>;
    updateFlagCharge(id: string, body: any): Promise<any>;
    deleteFlagCharge(id: string): Promise<{
        message: string;
    }>;
    getDailyExpenses(query: any): Promise<any[]>;
    getDailyExpense(id: string): Promise<any>;
    createDailyExpense(body: any): Promise<any>;
    updateDailyExpense(id: string, body: any): Promise<any>;
    deleteDailyExpense(id: string): Promise<{
        message: string;
    }>;
    getInvitationCodes(query: any): Promise<any[]>;
    getInvitationCode(id: string): Promise<any>;
    createInvitationCode(body: any): Promise<any>;
    updateInvitationCode(id: string, body: any): Promise<any>;
    deleteInvitationCode(id: string): Promise<{
        message: string;
    }>;
    getUserClubs(query: any): Promise<any[]>;
    getUserClub(id: string): Promise<any>;
    createUserClub(body: any): Promise<any>;
    updateUserClub(id: string, body: any): Promise<any>;
    deleteUserClub(id: string): Promise<{
        message: string;
    }>;
    getNotifications(query: any): Promise<any[]>;
    getNotification(id: string): Promise<any>;
    createNotification(body: any): Promise<any>;
    updateNotification(id: string, body: any): Promise<any>;
    deleteNotification(id: string): Promise<void>;
    getFeedbacks(query: any): Promise<any[]>;
    getFeedback(id: string): Promise<any>;
    createFeedback(body: any): Promise<any>;
    updateFeedback(id: string, body: any): Promise<any>;
    deleteFeedback(id: string): Promise<{
        message: string;
    }>;
    getDatabaseStats(): Promise<any>;
    backupDatabase(): Promise<{
        success: boolean;
        message: string;
        backupPath: string;
    }>;
    restoreDatabase(body: {
        backupPath: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
