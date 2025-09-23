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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagChargeService = void 0;
const common_1 = require("@nestjs/common");
const json_server_service_1 = require("../../services/json-server.service");
const uploadFileHandler_1 = require("../../utils/uploadFileHandler");
let FlagChargeService = class FlagChargeService {
    jsonServerService;
    constructor(jsonServerService) {
        this.jsonServerService = jsonServerService;
    }
    async create({ reasons, comment }, id, req, uploadedFile) {
        try {
            const userId = req.user.id;
            const userRole = req.user.roles;
            const transaction = await this.jsonServerService.getTransaction(id);
            if (!transaction) {
                throw new common_1.BadRequestException('Transaction not found');
            }
            if (userRole === 'member') {
                const allUsers = await this.jsonServerService.getUsers();
                const subMembers = allUsers.filter((u) => String(u.parentId) === String(userId) && u.roles === 'submember');
                const allowedUserIds = new Set([
                    String(userId),
                    ...subMembers.map((s) => String(s.id)),
                ]);
                if (!allowedUserIds.has(String(transaction.userId))) {
                    throw new common_1.UnauthorizedException('You can only flag charges for yourself or your sub-members');
                }
            }
            else if (userRole === 'submember') {
                if (String(transaction.userId) !== String(userId)) {
                    throw new common_1.UnauthorizedException('You can only flag your own charges');
                }
            }
            const actingUser = await this.jsonServerService.getUser(userId);
            if (String(transaction.clubId) !== String(actingUser.currently_at)) {
                throw new common_1.UnauthorizedException('You can only flag charges in your current club');
            }
            if (transaction.status !== 'pending' &&
                transaction.status !== 'approved') {
                throw new common_1.BadRequestException('Only pending or approved transactions can be flagged');
            }
            if (transaction.flagChargeId) {
                throw new common_1.BadRequestException('Transaction is already flagged');
            }
            let filePath;
            if (uploadedFile) {
                const uploadResult = (0, uploadFileHandler_1.uploadFileHandler)(uploadedFile.originalname, uploadedFile);
                if (!uploadResult.success) {
                    throw new common_1.BadRequestException(uploadResult.message);
                }
                filePath = uploadResult.data?.filePath;
            }
            const flagCharge = await this.jsonServerService.createFlagCharge({
                reasons,
                comment,
                file: filePath,
                userId,
                transactionId: transaction.id,
                flaggedBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const updatedTransaction = await this.jsonServerService.updateTransaction(transaction.id, {
                flagChargeId: flagCharge.id,
                status: 'refused',
                verifyCharge: false,
                date: transaction.date,
                createdAt: transaction.createdAt,
                updatedAt: new Date().toISOString(),
            });
            const allUsers = await this.jsonServerService.getUsers();
            const userInfo = allUsers.find((u) => String(u.id) === String(updatedTransaction.userId));
            const parentInfo = allUsers.find((u) => String(u.id) === String(userId));
            const clubDetails = await this.jsonServerService.getClub(transaction.clubId);
            const parentBody = `You flagged the transaction of $${transaction.bill} made by ${userInfo?.fullname} in ${clubDetails?.name}.`;
            await this.jsonServerService.createNotification({
                userId,
                clubId: clubDetails.id,
                title: 'Transaction Flagged',
                body: parentBody,
            });
            if (userInfo?.roles === 'submember') {
                const childBody = `Your transaction of $${transaction.bill} was flagged by ${parentInfo?.fullname} in ${clubDetails?.name}. Please review it.`;
                await this.jsonServerService.createNotification({
                    userId: transaction.userId,
                    clubId: clubDetails.id,
                    title: 'Transaction Flagged',
                    body: childBody,
                });
            }
            return {
                success: true,
                message: 'Charge flagged successfully',
                data: {
                    ...updatedTransaction,
                    userName: userInfo?.fullname || userInfo?.userName || null,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    findAll() {
        return `This action returns all flagCharge`;
    }
};
exports.FlagChargeService = FlagChargeService;
exports.FlagChargeService = FlagChargeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_server_service_1.JsonServerService])
], FlagChargeService);
//# sourceMappingURL=flag-charge.service.js.map