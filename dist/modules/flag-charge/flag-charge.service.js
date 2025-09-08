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
const axios_1 = require("@nestjs/axios");
const json_server_service_1 = require("../../services/json-server.service");
const uploadFileHandler_1 = require("../../utils/uploadFileHandler");
let FlagChargeService = class FlagChargeService {
    httpService;
    jsonServerService;
    constructor(httpService, jsonServerService) {
        this.httpService = httpService;
        this.jsonServerService = jsonServerService;
    }
    async create({ reasons, comment, file }, id, req, uploadedFile) {
        try {
            const userId = req.user.id;
            const userRole = req.user.roles;
            const transaction = await this.jsonServerService.getTransaction(id);
            console.log(transaction);
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
            if (transaction.status !== 'pending' && transaction.status !== 'approved') {
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
                severity: 'medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const updatedTransaction = await this.jsonServerService.updateTransaction(transaction.id, {
                flagChargeId: flagCharge.id,
                status: 'refused',
                updatedAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Charge flagged successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to flag charge',
                data: null,
                error: error.message,
            };
        }
    }
    findAll() {
        return `This action returns all flagCharge`;
    }
};
exports.FlagChargeService = FlagChargeService;
exports.FlagChargeService = FlagChargeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        json_server_service_1.JsonServerService])
], FlagChargeService);
//# sourceMappingURL=flag-charge.service.js.map