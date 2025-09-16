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
const createGenerationCode_1 = require("../../utils/createGenerationCode");
const json_server_service_1 = require("../../services/json-server.service");
const transactions_service_1 = require("../transactions/transactions.service");
const common_2 = require("@nestjs/common");
const log = new common_2.Logger('SubMemberService');
let SubMemberService = SubMemberService_1 = class SubMemberService {
    jsonServerService;
    transactionService;
    constructor(jsonServerService, transactionService) {
        this.jsonServerService = jsonServerService;
        this.transactionService = transactionService;
    }
    logger = new common_2.Logger(SubMemberService_1.name);
    fields = {
        roles: 'submember',
    };
    async switchClub(clubId, req) {
        try {
            const user = req.user;
            const userId = String(user.id);
            const memberClubs = await this.jsonServerService.getClubsFormember(userId);
            const targetClub = memberClubs.find((club) => String(club.clubId) === String(clubId));
            if (!targetClub) {
                return {
                    success: false,
                    message: 'You are not a member of this club',
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
                        id: targetClub.clubId,
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
            const parent = req.user;
            const users = await this.jsonServerService.getUsers({
                email: createSubMemberDto.email,
            });
            if (users && users.length > 0) {
                throw new common_1.BadRequestException('User Already Exist!');
            }
            const subMember = await this.jsonServerService.createUser({
                ...createSubMemberDto,
                ...this.fields,
                parentId: parent.id,
                currently_at: parent.currently_at,
                roles: 'submember',
            });
            const memberClubs = await this.jsonServerService.getClubsFormember(parent.id);
            if (!memberClubs || memberClubs.length === 0) {
                throw new common_1.BadRequestException('Parent does not belong to any clubs');
            }
            const clubIds = [...new Set(memberClubs.map((club) => club.clubId))];
            const userClubPromises = clubIds.map((clubId) => this.jsonServerService.createUserClub({
                userId: subMember.id,
                clubId,
                billingCycle: createSubMemberDto.BillingCycle,
                memberId: parent.id,
                totalAllowance: createSubMemberDto.allowance,
                totalSpent: 0,
            }));
            await Promise.all(userClubPromises);
            const invitationCode = (0, createGenerationCode_1.generateInvitationCode)();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const invitationCodeData = await this.jsonServerService.createInvitationCode({
                invitationCode,
                subMemberId: subMember.id,
                memberId: parent.id,
                status: 'active',
                expiresAt: expiresAt.toISOString(),
            });
            const allowance = createSubMemberDto.allowance;
            if (allowance <= 0) {
                throw new common_1.BadRequestException('Allowance must be greater than zero');
            }
            const categories = await this.transactionService.getCategories(req);
            if (!categories || categories.data.length < 2) {
                throw new common_1.BadRequestException('Not enough categories available');
            }
            const shuffled = [...categories.data].sort(() => 0.5 - Math.random());
            const uniqueCategories = Array.from(new Set(shuffled)).slice(0, 2);
            for (const clubId of clubIds) {
                const transaction1Bill = Math.floor(allowance * 0.3);
                const transaction2Bill = Math.floor(allowance * 0.2);
                await Promise.all([
                    this.jsonServerService.createTransaction({
                        clubId,
                        userId: subMember.id,
                        memberId: parent.id,
                        bill: transaction1Bill,
                        category: uniqueCategories[0],
                        description: uniqueCategories[0],
                        status: 'pending',
                        verifyCharge: false,
                        flagChargeId: false,
                        date: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                    }),
                    this.jsonServerService.createTransaction({
                        clubId,
                        userId: subMember.id,
                        memberId: parent.id,
                        bill: transaction2Bill,
                        category: uniqueCategories[1],
                        description: uniqueCategories[1],
                        status: 'pending',
                        verifyCharge: false,
                        flagChargeId: false,
                        date: new Date().toISOString(),
                    }),
                ]);
                const [userClub] = await this.jsonServerService.getUserClubs({
                    userId: subMember.id,
                    clubId,
                });
                if (userClub) {
                    await this.jsonServerService.updateUserClub(userClub.id, {
                        totalSpent: (userClub.totalSpent || 0) + transaction1Bill + transaction2Bill,
                    });
                }
            }
            const [userClubs] = await this.jsonServerService.getUserClubs({
                userId: subMember.id,
                clubId: subMember.currently_at,
            });
            const { password, ...subMemberWithoutPassword } = subMember;
            subMemberWithoutPassword.totalSpent = userClubs.totalSpent;
            return {
                success: true,
                message: 'Sub Member created successfully with default transactions and added to all member clubs!',
                data: {
                    subMember: subMemberWithoutPassword,
                    invitationCode: invitationCodeData.invitationCode,
                    expiresAt: invitationCodeData.expiresAt,
                    clubsAdded: memberClubs.length,
                },
            };
        }
        catch (error) {
            console.error('Error creating sub-member:', error);
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
        console.log(user);
        const memberId = String(user.id);
        const clubId = String(user.currently_at);
        const userClubs = await this.jsonServerService.getUserClubs({
            memberId: memberId,
            clubId,
        });
        console.log(userClubs);
        const subMemberIds = userClubs.map((uc) => String(uc.userId));
        const allUsers = await this.jsonServerService.getUsers();
        const submembers = allUsers.filter((u) => subMemberIds.includes(String(u.id)) && u.roles === 'submember');
        const enriched = submembers.map((user) => {
            const uc = userClubs.find((x) => String(x.userId) === String(user.id));
            return {
                ...user,
                totalSpent: Number(uc?.totalSpent ?? 0),
                totalAllowance: Number(uc?.totalAllowance ?? 0),
            };
        });
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
            if (!subMember) {
                throw new common_1.NotFoundException('Sub Member not found');
            }
            const userClubs = await this.jsonServerService.getUserClubs({
                userId: id,
            });
            for (const uc of userClubs) {
                await this.jsonServerService.deleteUserClub(uc.id);
            }
            const transactions = await this.jsonServerService.getTransactions({
                userId: id,
            });
            if (transactions?.length > 0) {
                for (const tx of transactions) {
                    const flagCharges = await this.jsonServerService.getFlagCharges({
                        transactionId: tx.id,
                    });
                    if (flagCharges?.length > 0) {
                        for (const fc of flagCharges) {
                            await this.jsonServerService.deleteFlagCharge(fc.id);
                        }
                    }
                    await this.jsonServerService.deleteTransaction(tx.id);
                }
            }
            const expenses = await this.jsonServerService.getDailyExpenses({
                userId: id,
            });
            for (const exp of expenses) {
                await this.jsonServerService.deleteDailyExpense(exp.id);
            }
            const invitationCodes = await this.jsonServerService.getInvitationCodes({
                subMemberId: id,
            });
            for (const code of invitationCodes) {
                await this.jsonServerService.deleteInvitationCode(code.id);
            }
            await this.jsonServerService.deleteUser(id);
            return { success: true, message: 'Sub Member Removed!', subMember };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async editAllowance(userId, allowance) {
        try {
            const subMember = await this.jsonServerService.getUser(userId);
            if (!subMember) {
                return {
                    success: false,
                    message: 'Sub-member not found',
                    data: null,
                };
            }
            if (allowance < 0) {
                return {
                    success: false,
                    message: 'Allowance cannot be less than zero',
                    data: null,
                };
            }
            const [userClub] = await this.jsonServerService.getUserClubs({
                userId: String(userId),
                clubId: String(subMember.currently_at),
            });
            if (!userClub) {
                return {
                    success: false,
                    message: 'User is not part of this club',
                    data: null,
                };
            }
            if (allowance <= (userClub.totalSpent || 0)) {
                return {
                    success: false,
                    message: `New allowance (${allowance}) must be greater than total spent (${userClub.totalSpent}).`,
                    data: null,
                };
            }
            const updatedUserClub = await this.jsonServerService.updateUserClub(userClub.id, { totalAllowance: allowance });
            console.log(updatedUserClub);
            const data = await this.jsonServerService.getUserClub(userClub.id);
            console.log(data);
            return {
                success: true,
                message: 'New Allowance Set!',
                data: { userClub: updatedUserClub },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message ?? 'Edit allowance failed',
                data: null,
            };
        }
    }
    async getsubDashboard(id) {
        try {
            const user = await this.jsonServerService.getUser(id);
            if (!user)
                throw new Error('Unauthorized');
            const userId = String(user.id);
            const memberId = user.parentId != null ? String(user.parentId) : null;
            const currentClubId = String(user.currently_at);
            const [userClubs, transactions, clubDetails] = await Promise.all([
                this.jsonServerService.getUserClubs({
                    userId,
                    clubId: currentClubId,
                }),
                this.jsonServerService.getTransactions({
                    userId,
                    clubId: currentClubId,
                }),
                this.jsonServerService.getClub(currentClubId).catch(() => null),
            ]);
            const [userClub] = userClubs || [];
            console.log(userClub);
            const totalSpent = Number(userClub?.totalSpent ?? 0);
            const totalAllowance = Number(userClub?.totalAllowance ?? 0);
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
                    clubs: [clubDetails].filter(Boolean),
                    twoRecentTransactions,
                    transactions: transactionsWithDetails,
                    user: {
                        id: user.id,
                        fullname: user.fullname,
                        email: user.email,
                        profilePic: user.profilePic,
                        relation: user.relation,
                        allowance: totalAllowance,
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
            const userObj = await this.jsonServerService.getUser(user.id);
            const userId = String(userObj.id);
            const currentClubId = String(userObj.currently_at);
            const userClubRecords = await this.jsonServerService.getUserClubs({
                userId,
            });
            const currentUserClub = userClubRecords.find((uc) => String(uc.clubId) === currentClubId);
            if (!currentUserClub)
                throw new Error('User is not part of this club');
            const memberId = String(currentUserClub.memberId);
            const clubsPromise = userObj.roles === 'member'
                ? this.jsonServerService.getClubsForUser(memberId)
                : this.jsonServerService.getUserClubs({ userId });
            const [clubs, transactions, clubDetails] = await Promise.all([
                clubsPromise,
                this.jsonServerService.getTransactions({
                    userId,
                    clubId: currentClubId,
                }),
                this.jsonServerService.getClub(currentClubId).catch(() => null),
            ]);
            const totalSpent = Number(currentUserClub?.totalSpent ?? 0);
            const totalAllowance = Number(currentUserClub?.totalAllowance ?? 0);
            const remainingAllowance = totalAllowance - totalSpent;
            const recent = (transactions || [])
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime())
                .slice(0, 2);
            const twoRecentTransactions = recent.map((tx) => ({
                transactionId: tx.id,
                amount: Number(tx.bill ?? 0) || 0,
                category: tx.category ?? null,
                userName: userObj.fullname || 'Unknown',
            }));
            const transactionsWithDetails = recent.map((tx) => ({
                ...tx,
                clubName: clubDetails?.name || 'Unknown Club',
                canVerify: userObj.roles === 'member',
                canFlag: true,
            }));
            return {
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: {
                    summary: { totalSpent, totalAllowance, remainingAllowance },
                    clubs,
                    twoRecentTransactions,
                    transactions: transactionsWithDetails,
                    user: {
                        id: userObj.id,
                        fullname: userObj.fullname,
                        email: userObj.email,
                        relation: userObj.relation,
                        allowance: totalAllowance,
                    },
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve dashboard data',
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
        const [transactions, userClubs] = await Promise.all([
            this.jsonServerService.getTransactions({ userId, clubId: currentClubId }),
            this.jsonServerService.getUserClubs({ userId, clubId: currentClubId }),
        ]);
        const periodTx = (transactions ?? []).filter((tx) => this.isInPeriod(tx.createdAt, startDate, endDate));
        const totalSpent = this.calculateTotalSpent(periodTx);
        const [userClub] = userClubs || [];
        const totalAllowance = Number(userClub?.totalAllowance ?? 0);
        const remainingAllowance = totalAllowance - totalSpent;
        return {
            success: true,
            message: 'Dashboard summary fetched',
            data: {
                totalSpent,
                totalAllowance,
                remainingAllowance,
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
    __metadata("design:paramtypes", [json_server_service_1.JsonServerService,
        transactions_service_1.TransactionsService])
], SubMemberService);
//# sourceMappingURL=sub-member.service.js.map