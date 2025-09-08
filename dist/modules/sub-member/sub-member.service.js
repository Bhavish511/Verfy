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
var SubMemberService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubMemberService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const createGenerationCode_1 = require("../../utils/createGenerationCode");
const json_server_service_1 = require("../../services/json-server.service");
const transactions_service_1 = require("../transactions/transactions.service");
const common_2 = require("@nestjs/common");
const log = new common_2.Logger('SubMemberService');
let SubMemberService = SubMemberService_1 = class SubMemberService {
    httpService;
    jsonServerService;
    transactionService;
    constructor(httpService, jsonServerService, transactionService) {
        this.httpService = httpService;
        this.jsonServerService = jsonServerService;
        this.transactionService = transactionService;
    }
    logger = new common_2.Logger(SubMemberService_1.name);
    fields = {
        financeId: null,
        currently_at: null,
        roles: 'submember',
    };
    async switchClub(clubId, req) {
        try {
            const user = req.user;
            const userId = String(user.id);
            const clubs = await this.jsonServerService.getUserClubs({ userId });
            const targetClub = clubs.find((club) => String(club.clubId) === String(clubId));
            if (!targetClub) {
                return {
                    success: false,
                    message: 'You are not a submember of this club',
                    data: null,
                };
            }
            const updatedUser = await this.jsonServerService.updateUser(userId, {
                currently_at: clubId,
            });
            return {
                success: true,
                message: 'Club switched successfully',
                data: {
                    currentClub: {
                        id: targetClub.id,
                        name: targetClub.name,
                        location: targetClub.location,
                    },
                    user: updatedUser,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to switch club',
                data: null,
                error: error.message,
            };
        }
    }
    async createSubMember(createSubMemberDto, req) {
        try {
            console.log(req.user.email);
            console.log(createSubMemberDto.email);
            const users = await this.jsonServerService.getUsers({
                email: createSubMemberDto.email,
            });
            if (users && users.length > 0)
                throw new common_1.BadRequestException('User Already Exist!');
            const user = req.user;
            const finance = await this.jsonServerService.createFinance({
                totalAllowance: createSubMemberDto.allowance,
                totalSpent: 0,
            });
            const subMember = await this.jsonServerService.createUser({
                ...createSubMemberDto,
                ...this.fields,
                parentId: user.id,
                financeId: finance.id,
                currently_at: user.currently_at,
            });
            const memberClubs = await this.jsonServerService.getClubsForUser(user.id);
            const userClubPromises = memberClubs.map((memberClub) => this.jsonServerService.createUserClub({
                userId: subMember.id,
                clubId: memberClub.clubId,
                billingCycle: createSubMemberDto.BillingCycle,
                parentMemberId: user.id,
                totalAllowance: createSubMemberDto.allowance,
            }));
            await Promise.all(userClubPromises);
            const invitationCode = (0, createGenerationCode_1.generateInvitationCode)();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const invitationCodeData = await this.jsonServerService.createInvitationCode({
                invitationCode,
                subMemberId: subMember.id,
                memberId: user.id,
                status: 'active',
                expiresAt: expiresAt.toISOString(),
            });
            return {
                success: true,
                message: 'Sub Member created successfully and added to all member clubs!',
                data: {
                    subMember,
                    invitationCode: invitationCodeData.invitationCode,
                    expiresAt: invitationCodeData.expiresAt,
                    clubsAdded: memberClubs.length,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to create sub-member',
                error: error.message,
            };
        }
    }
    async getAllSubMembers(req) {
        const user = req.user;
        if (user.roles !== 'member') {
            throw new common_1.BadRequestException('You are not eligible to get Sub members!');
        }
        const memberId = String(user.id);
        const clubId = String(user.currently_at);
        const submembers = await this.jsonServerService.getUsers({
            parentId: memberId,
            roles: 'submember',
        });
        const transactions = await this.jsonServerService.getTransactions({
            clubId,
        });
        const spentByUser = new Map();
        for (const tx of transactions || []) {
            const uid = String(tx.userId);
            const bill = Number(tx.bill) || 0;
            spentByUser.set(uid, (spentByUser.get(uid) || 0) + bill);
        }
        const enriched = submembers.map((s) => ({
            ...s,
            totalSpent: spentByUser.get(String(s.id)) || 0,
        }));
        return {
            success: true,
            data: {
                users: enriched,
            },
        };
    }
    async removeSubMember(id) {
        try {
            const subMember = await this.jsonServerService.getUser(id);
            await this.jsonServerService.deleteUser(id);
            const invitationCodes = await this.jsonServerService.getInvitationCodes({
                subMemberId: id,
            });
            for (const code of invitationCodes) {
                await this.jsonServerService.deleteInvitationCode(code.id);
            }
            return { success: true, message: 'Sub Member Removed!', subMember };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async editAllowance(id, allowance) {
        try {
            const subMember = await this.jsonServerService.getUser(id);
            if (!subMember) {
                throw new common_1.BadRequestException('Sub-member not found');
            }
            if (allowance < 0) {
                throw new common_1.BadRequestException('Allowance cannot be less than zero');
            }
            const finance = await this.jsonServerService.updateFinance(subMember.financeId, { totalAllowance: allowance });
            return {
                success: true,
                message: 'New Allowance Set!',
                data: { finance },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async getsubDashboard(id) {
        try {
            console.log(id);
            const user = await this.jsonServerService.getUser(id);
            console.log();
            if (!user)
                throw new Error('Unauthorized');
            const userId = String(user.id);
            const parentMemberId = user.parentId != null ? String(user.parentId) : null;
            const currentClubId = String(user.currently_at);
            const [clubs, transactions, finance, clubDetails] = await Promise.all([
                this.jsonServerService.getClubsForUser(parentMemberId ?? userId),
                this.jsonServerService.getTransactions({
                    userId,
                    clubId: currentClubId,
                }),
                this.jsonServerService.getFinance(user.financeId),
                this.jsonServerService.getClub(currentClubId).catch(() => null),
            ]);
            const totalSpent = Number(finance?.totalSpent ?? 0);
            const totalAllowance = Number(finance?.totalAllowance ?? 0);
            const remainingAllowance = totalAllowance - totalSpent;
            const recent = (transactions || [])
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime())
                .slice(0, 2);
            const twoRecentTransactions = recent.map((tx) => ({
                transactionId: tx.id,
                amount: Number(tx.bill ?? tx.amount ?? 0) || 0,
                category: tx.category ?? null,
                userName: user.fullname || 'Unknown',
            }));
            const transactionsWithDetails = recent.map((tx) => ({
                ...tx,
                clubName: clubDetails?.name || 'Unknown Club',
                canVerify: false,
                canFlag: true,
            }));
            return {
                success: true,
                message: 'Sub-member dashboard data retrieved successfully',
                data: {
                    summary: { totalSpent, totalAllowance, remainingAllowance },
                    clubs,
                    twoRecentTransactions,
                    transactions: transactionsWithDetails,
                    finance,
                    user: {
                        id: user.id,
                        fullname: user.fullname,
                        email: user.email,
                        relation: user.relation,
                        allowance: user.allowance,
                    },
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve sub-member dashboard data against member',
                data: null,
                error: error.message,
            };
        }
    }
    async getDashboard(req) {
        try {
            const user = req.user;
            if (!user)
                throw new Error('Unauthorized');
            const userId = String(user.id);
            const parentMemberId = user.parentId != null ? String(user.parentId) : null;
            const currentClubId = String(user.currently_at);
            const [clubs, transactions, finance, clubDetails] = await Promise.all([
                this.jsonServerService.getClubsForUser(parentMemberId ?? userId),
                this.jsonServerService.getTransactions({
                    userId,
                    clubId: currentClubId,
                }),
                this.jsonServerService.getFinance(user.financeId),
                this.jsonServerService.getClub(currentClubId).catch(() => null),
            ]);
            const totalSpent = Number(finance?.totalSpent ?? 0);
            const totalAllowance = Number(finance?.totalAllowance ?? 0);
            const remainingAllowance = totalAllowance - totalSpent;
            const recent = (transactions || [])
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime())
                .slice(0, 2);
            const twoRecentTransactions = recent.map((tx) => ({
                transactionId: tx.id,
                amount: Number(tx.bill ?? tx.amount ?? 0) || 0,
                category: tx.category ?? null,
                userName: user.fullname || 'Unknown',
            }));
            const transactionsWithDetails = recent.map((tx) => ({
                ...tx,
                clubName: clubDetails?.name || 'Unknown Club',
                canVerify: false,
                canFlag: true,
            }));
            return {
                success: true,
                message: 'Sub-member dashboard data retrieved successfully',
                data: {
                    summary: { totalSpent, totalAllowance, remainingAllowance },
                    clubs,
                    twoRecentTransactions,
                    transactions: transactionsWithDetails,
                    finance,
                    user: {
                        id: user.id,
                        fullname: user.fullname,
                        email: user.email,
                        relation: user.relation,
                        allowance: user.allowance,
                    },
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve sub-member dashboard data',
                data: null,
                error: error.message,
            };
        }
    }
    async validateInvitationCode(invitationCode) {
        try {
            const invitationCodes = await this.jsonServerService.getInvitationCodes({
                invitationCode,
            });
            const match = invitationCodes[0];
            if (!match)
                throw new common_1.NotFoundException('Invitation code not found.');
            if (!match.subMemberId)
                throw new common_1.BadRequestException('Invalid invitation code.');
            if (match.status !== 'active') {
                throw new common_1.BadRequestException('Invitation code is no longer active.');
            }
            const now = new Date();
            const expiresAt = new Date(match.expiresAt);
            if (now > expiresAt) {
                await this.jsonServerService.updateInvitationCode(match.id, {
                    status: 'expired',
                });
                throw new common_1.BadRequestException('Invitation code has expired.');
            }
            const user = await this.jsonServerService.getUser(match.subMemberId);
            if (!user)
                throw new common_1.NotFoundException('Sub member not found for this code.');
            await this.jsonServerService.updateInvitationCode(match.id, {
                status: 'used',
                usedAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Invitation code validated successfully!',
                data: user,
            };
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException ||
                err instanceof common_1.NotFoundException ||
                err instanceof common_1.UnauthorizedException ||
                err instanceof common_1.ForbiddenException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException('Failed to validate invitation code.');
        }
    }
    async getSubMemberDashboardSummary(req, period) {
        const user = req.user;
        if (!user)
            throw new Error('Unauthorized');
        const userId = String(user.id);
        const currentClubId = String(user.currently_at);
        const { startDate, endDate } = this.getPeriodDateRange(period);
        const [transactions, finance] = await Promise.all([
            this.jsonServerService.getTransactions({ userId, clubId: currentClubId }),
            this.jsonServerService.getFinance(user.financeId),
        ]);
        const periodTx = (transactions ?? []).filter((tx) => this.isInPeriod(tx.createdAt, startDate, endDate));
        const totalSpent = this.calculateTotalSpent(periodTx);
        const totalAllowance = Number(finance?.totalAllowance ?? 0);
        const remainingAllowance = totalAllowance - totalSpent;
        return {
            success: true,
            message: 'Dashboard summary fetched',
            data: {
                totalSpent,
            },
        };
    }
    getPeriodDateRange(period) {
        const now = new Date();
        now.setSeconds(0, 0);
        let startDate;
        let endDate;
        switch ((period || 'monthly').toLowerCase()) {
            case 'daily':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);
                break;
            case 'weekly': {
                startDate = new Date(now);
                const day = (startDate.getDay() + 6) % 7;
                startDate.setHours(0, 0, 0, 0);
                startDate.setDate(startDate.getDate() - day);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 7);
                break;
            }
            case 'monthly':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
                break;
        }
        return { startDate, endDate };
    }
    isInPeriod(dateString, startDate, endDate) {
        const d = new Date(dateString);
        return d >= startDate && d < endDate;
    }
    calculateTotalSpent(transactions) {
        return (transactions ?? []).reduce((sum, tx) => sum + (Number(tx?.bill) || 0), 0);
    }
};
exports.SubMemberService = SubMemberService;
exports.SubMemberService = SubMemberService = SubMemberService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        json_server_service_1.JsonServerService,
        transactions_service_1.TransactionsService])
], SubMemberService);
//# sourceMappingURL=sub-member.service.js.map