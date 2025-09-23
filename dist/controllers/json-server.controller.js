"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JsonServerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonServerController = void 0;
const common_1 = require("@nestjs/common");
const json_server_service_1 = require("../services/json-server.service");
let JsonServerController = JsonServerController_1 = class JsonServerController {
    jsonServerService;
    logger = new common_1.Logger(JsonServerController_1.name);
    constructor(jsonServerService) {
        this.jsonServerService = jsonServerService;
    }
    async getUsers(query) {
        try {
            return await this.jsonServerService.getUsers(query);
        }
        catch (error) {
            this.logger.error('Error getting users:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUser(id) {
        try {
            return await this.jsonServerService.getUser(id);
        }
        catch (error) {
            this.logger.error(`Error getting user ${id}:`, error);
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createUser(body) {
        try {
            return await this.jsonServerService.createUser(body);
        }
        catch (error) {
            this.logger.error('Error creating user:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateUser(id, body) {
        try {
            return await this.jsonServerService.updateUser(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating user ${id}:`, error);
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteUser(id) {
        try {
            await this.jsonServerService.deleteUser(id);
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting user ${id}:`, error);
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getClubs(query) {
        try {
            return await this.jsonServerService.getClubs(query);
        }
        catch (error) {
            this.logger.error('Error getting clubs:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getClub(id) {
        try {
            return await this.jsonServerService.getClub(id);
        }
        catch (error) {
            this.logger.error(`Error getting club ${id}:`, error);
            throw new common_1.HttpException('Club not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createClub(body) {
        try {
            return await this.jsonServerService.createClub(body);
        }
        catch (error) {
            this.logger.error('Error creating club:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateClub(id, body) {
        try {
            return await this.jsonServerService.updateClub(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating club ${id}:`, error);
            throw new common_1.HttpException('Club not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteClub(id) {
        try {
            await this.jsonServerService.deleteClub(id);
            return { message: 'Club deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting club ${id}:`, error);
            throw new common_1.HttpException('Club not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getFinances(query) {
        try {
            return await this.jsonServerService.getFinances(query);
        }
        catch (error) {
            this.logger.error('Error getting finances:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFinance(id) {
        try {
            return await this.jsonServerService.getFinance(id);
        }
        catch (error) {
            this.logger.error(`Error getting finance ${id}:`, error);
            throw new common_1.HttpException('Finance not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createFinance(body) {
        try {
            return await this.jsonServerService.createFinance(body);
        }
        catch (error) {
            this.logger.error('Error creating finance:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateFinance(id, body) {
        try {
            return await this.jsonServerService.updateFinance(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating finance ${id}:`, error);
            throw new common_1.HttpException('Finance not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteFinance(id) {
        try {
            await this.jsonServerService.deleteFinance(id);
            return { message: 'Finance deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting finance ${id}:`, error);
            throw new common_1.HttpException('Finance not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getTransactions(query) {
        try {
            return await this.jsonServerService.getTransactions(query);
        }
        catch (error) {
            this.logger.error('Error getting transactions:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTransaction(id) {
        try {
            return await this.jsonServerService.getTransaction(id);
        }
        catch (error) {
            this.logger.error(`Error getting transaction ${id}:`, error);
            throw new common_1.HttpException('Transaction not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createTransaction(body) {
        try {
            return await this.jsonServerService.createTransaction(body);
        }
        catch (error) {
            this.logger.error('Error creating transaction:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateTransaction(id, body) {
        try {
            return await this.jsonServerService.updateTransaction(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating transaction ${id}:`, error);
            throw new common_1.HttpException('Transaction not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteTransaction(id) {
        try {
            await this.jsonServerService.deleteTransaction(id);
            return { message: 'Transaction deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting transaction ${id}:`, error);
            throw new common_1.HttpException('Transaction not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getFlagCharges(query) {
        try {
            return await this.jsonServerService.getFlagCharges(query);
        }
        catch (error) {
            this.logger.error('Error getting flag charges:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFlagCharge(id) {
        try {
            return await this.jsonServerService.getFlagCharge(id);
        }
        catch (error) {
            this.logger.error(`Error getting flag charge ${id}:`, error);
            throw new common_1.HttpException('Flag charge not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createFlagCharge(body) {
        try {
            return await this.jsonServerService.createFlagCharge(body);
        }
        catch (error) {
            this.logger.error('Error creating flag charge:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateFlagCharge(id, body) {
        try {
            return await this.jsonServerService.updateFlagCharge(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating flag charge ${id}:`, error);
            throw new common_1.HttpException('Flag charge not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteFlagCharge(id) {
        try {
            await this.jsonServerService.deleteFlagCharge(id);
            return { message: 'Flag charge deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting flag charge ${id}:`, error);
            throw new common_1.HttpException('Flag charge not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getDailyExpenses(query) {
        try {
            return await this.jsonServerService.getDailyExpenses(query);
        }
        catch (error) {
            this.logger.error('Error getting daily expenses:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDailyExpense(id) {
        try {
            return await this.jsonServerService.getDailyExpense(id);
        }
        catch (error) {
            this.logger.error(`Error getting daily expense ${id}:`, error);
            throw new common_1.HttpException('Daily expense not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createDailyExpense(body) {
        try {
            return await this.jsonServerService.createDailyExpense(body);
        }
        catch (error) {
            this.logger.error('Error creating daily expense:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateDailyExpense(id, body) {
        try {
            return await this.jsonServerService.updateDailyExpense(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating daily expense ${id}:`, error);
            throw new common_1.HttpException('Daily expense not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteDailyExpense(id) {
        try {
            await this.jsonServerService.deleteDailyExpense(id);
            return { message: 'Daily expense deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting daily expense ${id}:`, error);
            throw new common_1.HttpException('Daily expense not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getInvitationCodes(query) {
        try {
            return await this.jsonServerService.getInvitationCodes(query);
        }
        catch (error) {
            this.logger.error('Error getting invitation codes:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getInvitationCode(id) {
        try {
            return await this.jsonServerService.getInvitationCode(id);
        }
        catch (error) {
            this.logger.error(`Error getting invitation code ${id}:`, error);
            throw new common_1.HttpException('Invitation code not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createInvitationCode(body) {
        try {
            return await this.jsonServerService.createInvitationCode(body);
        }
        catch (error) {
            this.logger.error('Error creating invitation code:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateInvitationCode(id, body) {
        try {
            return await this.jsonServerService.updateInvitationCode(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating invitation code ${id}:`, error);
            throw new common_1.HttpException('Invitation code not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteInvitationCode(id) {
        try {
            await this.jsonServerService.deleteInvitationCode(id);
            return { message: 'Invitation code deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting invitation code ${id}:`, error);
            throw new common_1.HttpException('Invitation code not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getUserClubs(query) {
        try {
            return await this.jsonServerService.getUserClubs(query);
        }
        catch (error) {
            this.logger.error('Error getting user clubs:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserClub(id) {
        try {
            return await this.jsonServerService.getUserClub(id);
        }
        catch (error) {
            this.logger.error(`Error getting user club ${id}:`, error);
            throw new common_1.HttpException('User club not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createUserClub(body) {
        try {
            return await this.jsonServerService.createUserClub(body);
        }
        catch (error) {
            this.logger.error('Error creating user club:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateUserClub(id, body) {
        try {
            return await this.jsonServerService.updateUserClub(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating user club ${id}:`, error);
            throw new common_1.HttpException('User club not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteUserClub(id) {
        try {
            await this.jsonServerService.deleteUserClub(id);
            return { message: 'User club deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting user club ${id}:`, error);
            throw new common_1.HttpException('User club not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getNotifications(query) {
        try {
            return await this.jsonServerService.getNotifications(query);
        }
        catch (error) {
            this.logger.error('Error getting notifications:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNotification(id) {
        try {
            return await this.jsonServerService.getNotification(id);
        }
        catch (error) {
            this.logger.error(`Error getting Notification ${id}:`, error);
            throw new common_1.HttpException('Notification Not Found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createNotification(body) {
        try {
            return await this.jsonServerService.createNotification(body);
        }
        catch (error) {
            this.logger.error('Error creating Notification:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateNotification(id, body) {
        try {
            return await this.jsonServerService.updateNotification(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating Notification ${id}:`, error);
            throw new common_1.HttpException('Notification Not Found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteNotification(id) {
        try {
            return await this.jsonServerService.deleteNotification(id);
        }
        catch (error) {
            this.logger.error(`Error deleting Notification ${id}:`, error);
            throw new common_1.HttpException('Notification Not Found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getFeedbacks(query) {
        try {
            return await this.jsonServerService.getFeedbacks(query);
        }
        catch (error) {
            this.logger.error('Error getting feedbacks:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFeedback(id) {
        try {
            return await this.jsonServerService.getFeedback(id);
        }
        catch (error) {
            this.logger.error(`Error getting feedback ${id}:`, error);
            throw new common_1.HttpException('Feedback not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createFeedback(body) {
        try {
            return await this.jsonServerService.createFeedback(body);
        }
        catch (error) {
            this.logger.error('Error creating feedback:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateFeedback(id, body) {
        try {
            return await this.jsonServerService.updateFeedback(id, body);
        }
        catch (error) {
            this.logger.error(`Error updating feedback ${id}:`, error);
            throw new common_1.HttpException('Feedback not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async deleteFeedback(id) {
        try {
            await this.jsonServerService.deleteFeedback(id);
            return { message: 'Feedback deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting feedback ${id}:`, error);
            throw new common_1.HttpException('Feedback not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getDatabaseStats() {
        try {
            return await this.jsonServerService.getDatabaseStats();
        }
        catch (error) {
            this.logger.error('Error getting database stats:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async backupDatabase() {
        try {
            const backupPath = await this.jsonServerService.backupDatabase();
            return {
                success: true,
                message: 'Database backup created successfully',
                backupPath
            };
        }
        catch (error) {
            this.logger.error('Error creating database backup:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async restoreDatabase(body) {
        try {
            await this.jsonServerService.restoreDatabase(body.backupPath);
            return {
                success: true,
                message: 'Database restored successfully'
            };
        }
        catch (error) {
            this.logger.error('Error restoring database:', error);
            throw new common_1.HttpException('Internal server error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.JsonServerController = JsonServerController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('users'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('clubs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getClubs", null);
__decorate([
    (0, common_1.Get)('clubs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getClub", null);
__decorate([
    (0, common_1.Post)('clubs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createClub", null);
__decorate([
    (0, common_1.Put)('clubs/:id'),
    (0, common_1.Patch)('clubs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateClub", null);
__decorate([
    (0, common_1.Delete)('clubs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteClub", null);
__decorate([
    (0, common_1.Get)('finances'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getFinances", null);
__decorate([
    (0, common_1.Get)('finances/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getFinance", null);
__decorate([
    (0, common_1.Post)('finances'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createFinance", null);
__decorate([
    (0, common_1.Put)('finances/:id'),
    (0, common_1.Patch)('finances/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateFinance", null);
__decorate([
    (0, common_1.Delete)('finances/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteFinance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Put)('transactions/:id'),
    (0, common_1.Patch)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Delete)('transactions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteTransaction", null);
__decorate([
    (0, common_1.Get)('flagCharges'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getFlagCharges", null);
__decorate([
    (0, common_1.Get)('flagCharges/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getFlagCharge", null);
__decorate([
    (0, common_1.Post)('flagCharges'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createFlagCharge", null);
__decorate([
    (0, common_1.Put)('flagCharges/:id'),
    (0, common_1.Patch)('flagCharges/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateFlagCharge", null);
__decorate([
    (0, common_1.Delete)('flagCharges/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteFlagCharge", null);
__decorate([
    (0, common_1.Get)('daily_expenses'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getDailyExpenses", null);
__decorate([
    (0, common_1.Get)('daily_expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getDailyExpense", null);
__decorate([
    (0, common_1.Post)('daily_expenses'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createDailyExpense", null);
__decorate([
    (0, common_1.Put)('daily_expenses/:id'),
    (0, common_1.Patch)('daily_expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateDailyExpense", null);
__decorate([
    (0, common_1.Delete)('daily_expenses/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteDailyExpense", null);
__decorate([
    (0, common_1.Get)('invitationCode'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getInvitationCodes", null);
__decorate([
    (0, common_1.Get)('invitationCode/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getInvitationCode", null);
__decorate([
    (0, common_1.Post)('invitationCode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createInvitationCode", null);
__decorate([
    (0, common_1.Put)('invitationCode/:id'),
    (0, common_1.Patch)('invitationCode/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateInvitationCode", null);
__decorate([
    (0, common_1.Delete)('invitationCode/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteInvitationCode", null);
__decorate([
    (0, common_1.Get)('user_clubs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getUserClubs", null);
__decorate([
    (0, common_1.Get)('user_clubs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getUserClub", null);
__decorate([
    (0, common_1.Post)('user_clubs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createUserClub", null);
__decorate([
    (0, common_1.Put)('user_clubs/:id'),
    (0, common_1.Patch)('user_clubs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateUserClub", null);
__decorate([
    (0, common_1.Delete)('user_clubs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteUserClub", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('notifications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getNotification", null);
__decorate([
    (0, common_1.Post)('notifications'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Put)('notifications/:id'),
    (0, common_1.Patch)('notifications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateNotification", null);
__decorate([
    (0, common_1.Delete)('notifications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('feedbacks'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getFeedbacks", null);
__decorate([
    (0, common_1.Get)('feedbacks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getFeedback", null);
__decorate([
    (0, common_1.Post)('feedbacks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "createFeedback", null);
__decorate([
    (0, common_1.Put)('feedbacks/:id'),
    (0, common_1.Patch)('feedbacks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "updateFeedback", null);
__decorate([
    (0, common_1.Delete)('feedbacks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "deleteFeedback", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "getDatabaseStats", null);
__decorate([
    (0, common_1.Post)('backup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "backupDatabase", null);
__decorate([
    (0, common_1.Post)('restore'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JsonServerController.prototype, "restoreDatabase", null);
exports.JsonServerController = JsonServerController = JsonServerController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [json_server_service_1.JsonServerService])
], JsonServerController);
//# sourceMappingURL=json-server.controller.js.map