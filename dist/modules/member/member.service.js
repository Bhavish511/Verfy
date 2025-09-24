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
exports.MemberService = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("../transactions/transactions.service");
const json_server_service_1 = require("../../services/json-server.service");
let MemberService = class MemberService {
    transactionService;
    jsonServerService;
    constructor(transactionService, jsonServerService) {
        this.transactionService = transactionService;
        this.jsonServerService = jsonServerService;
    }
    async getAllNotifications(req) {
        try {
            const user = req.user;
            const userId = String(user.id);
            const clubId = String(user.currently_at);
            const notifications = await this.jsonServerService.getNotifications({
                userId,
                clubId,
            });
            notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            console.log(notifications);
            return {
                success: true,
                message: 'Notifications fetched successfully',
                data: { notifications },
            };
        }
        catch (error) {
            console.error('Error fetching Notifications:', error);
            return {
                success: false,
                message: 'Failed Fetch Notifications',
                error: error.message,
            };
        }
    }
    async getDashboard(req) {
        try {
            const userId = String(req.user.id);
            const currentClubId = String(req.user.currently_at);
            console.log(userId);
            const [allUserClubs, { data: transactionsData }, allUsers] = await Promise.all([
                this.jsonServerService.getUserClubs({ memberId: userId }),
                this.transactionService.findAllForMember(req),
                this.jsonServerService.getUsers(),
            ]);
            const subMembers = allUsers.filter((u) => String(u.parentId) === userId && u.roles === 'submember');
            const allowedUserIds = new Set([
                userId,
                ...subMembers.map((s) => String(s.id)),
            ]);
            const userById = new Map(allUsers.map((u) => [String(u.id), u]));
            const nameOf = (uid) => userById.get(String(uid))?.fullname || 'Unknown';
            const relevantClubs = allUserClubs.filter((uc) => allowedUserIds.has(String(uc.userId)) &&
                String(uc.clubId) === currentClubId);
            const totalSpentAll = relevantClubs.reduce((sum, uc) => sum + (Number(uc.totalSpent) || 0), 0);
            const totalAllowanceAll = relevantClubs.reduce((sum, uc) => sum + (Number(uc.totalAllowance) || 0), 0);
            const remainingAllowanceAll = totalAllowanceAll - totalSpentAll;
            const subMemberBreakdown = subMembers.map((sm) => {
                const memberClub = relevantClubs.find((uc) => String(uc.userId) === String(sm.id));
                const allowance = memberClub
                    ? Number(memberClub.totalAllowance) || 0
                    : 0;
                const spent = memberClub ? Number(memberClub.totalSpent) || 0 : 0;
                return {
                    id: sm.id,
                    name: sm.fullname,
                    totalSpent: spent,
                    totalAllowance: allowance,
                    remainingAllowance: allowance - spent,
                };
            });
            const parentClubIds = [
                ...new Set(allUserClubs
                    .filter((uc) => String(uc.userId) === userId)
                    .map((uc) => uc.clubId)),
            ];
            const clubs = (await Promise.all(parentClubIds.map((id) => this.jsonServerService.getClubs({ id })))).flat();
            const pendingApprovals = transactionsData?.pendingApprovals ?? 0;
            const allPending = transactionsData?.pendingCharges ?? [];
            const filteredPending = allPending.filter((c) => allowedUserIds.has(String(c.userId)) &&
                String(c.clubId) === currentClubId);
            const top2Pending = filteredPending
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime())
                .slice(0, 2);
            const pendingTransactions = top2Pending.map((charge) => ({
                transactionId: charge.id,
                amount: charge.bill ?? 0,
                category: charge.category ?? null,
                userName: nameOf(charge.userId),
            }));
            const allTransactions = transactionsData?.transactions ?? [];
            const wantedIds = new Set(top2Pending.map((c) => String(c.id)));
            const transactions = allTransactions
                .filter((t) => wantedIds.has(String(t.id)))
                .map((t) => ({ ...t, userName: nameOf(t.userId) }));
            return {
                success: true,
                message: 'Member dashboard data retrieved successfully',
                data: {
                    summary: {
                        totalSpent: totalSpentAll,
                        totalAllowance: totalAllowanceAll,
                        remainingAllowance: remainingAllowanceAll,
                        pendingApprovals,
                    },
                    clubs: clubs.map((club) => ({
                        id: club.id,
                        name: club.name,
                        location: club.location,
                        isActive: String(club.id) === currentClubId,
                    })),
                    pendingTransactions,
                    transactions,
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
    async getMemberDashboardSummary(req, period) {
        const user = req.user;
        if (!user)
            throw new Error('Unauthorized');
        const memberId = String(user.id);
        const currentClubId = String(user.currently_at);
        let totalSpent = 0;
        if (period !== 'all') {
            const { startDate, endDate } = this.getPeriodDateRange(period);
            const [transactions] = await Promise.all([
                this.jsonServerService.getTransactions({
                    memberId,
                    clubId: currentClubId,
                }),
            ]);
            const periodTx = (transactions ?? []).filter((tx) => this.isInPeriod(tx.createdAt, startDate, endDate));
            totalSpent = this.calculateTotalSpent(periodTx);
        }
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
    filterTransactionsByPeriod(transactions, period) {
        const now = new Date();
        let startDate;
        let periodInfo;
        switch (period?.toLowerCase()) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                periodInfo = {
                    name: 'Daily',
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: now.toISOString().split('T')[0],
                };
                break;
            case 'weekly':
                const dayOfWeek = now.getDay();
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek);
                startDate.setHours(0, 0, 0, 0);
                periodInfo = {
                    name: 'Weekly',
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: now.toISOString().split('T')[0],
                };
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                periodInfo = {
                    name: 'Monthly',
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: now.toISOString().split('T')[0],
                };
                break;
            default:
                periodInfo = {
                    name: 'All Time',
                    startDate: 'N/A',
                    endDate: now.toISOString().split('T')[0],
                };
                return { filteredTransactions: transactions, periodInfo };
        }
        const filteredTransactions = transactions.filter((tx) => {
            const dateString = tx.createdAt || tx.date || tx.updatedAt;
            if (!dateString)
                return false;
            const txDate = new Date(dateString);
            return txDate >= startDate && txDate <= now;
        });
        return { filteredTransactions, periodInfo };
    }
    findOne(id) {
        return `This action returns a #${id} member`;
    }
    update(id, updateMemberDto) {
        return `This action updates a #${id} member`;
    }
    remove(id) {
        return `This action removes a #${id} member`;
    }
};
exports.MemberService = MemberService;
exports.MemberService = MemberService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService,
        json_server_service_1.JsonServerService])
], MemberService);
//# sourceMappingURL=member.service.js.map