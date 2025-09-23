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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const json_server_service_1 = require("../../services/json-server.service");
function toStr(v) {
    return String(v);
}
let TransactionsService = class TransactionsService {
    jsonServerService;
    constructor(jsonServerService) {
        this.jsonServerService = jsonServerService;
    }
    async getCategories(req) {
        try {
            const user = req.user;
            console.log(user);
            const clubId = String(user.currently_at);
            const transactions = await this.jsonServerService.getTransactions({
                clubId,
            });
            const categories = [
                ...new Set(transactions.map((tx) => String(tx.category).trim())),
            ];
            return {
                success: true,
                message: 'Categories fetched successfully',
                data: categories,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to fetch categories');
        }
    }
    async create({ category, bill }, clubId, req) {
        try {
            const userId = String(req.user.id);
            const [userClub] = await this.jsonServerService.getUserClubs({
                userId,
                clubId: String(clubId),
            });
            console.log(userClub);
            if (!userClub) {
                throw new common_1.BadRequestException('User is not a member of this club');
            }
            if ((userClub.totalSpent || 0) + bill > userClub.totalAllowance) {
                throw new common_1.BadRequestException('Total Allowance Exceeded!');
            }
            const transaction = await this.jsonServerService.createTransaction({
                clubId: String(clubId),
                bill,
                userId,
                memberId: req.user.parentId || userId,
                category,
                status: 'pending',
                verifyCharge: false,
                flagChargeId: null,
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            });
            const updatedUserClub = await this.jsonServerService.updateUserClub(userClub.id, {
                totalSpent: (userClub.totalSpent || 0) + bill,
            });
            const expense = await this.jsonServerService.createDailyExpense({
                createdAt: Date.now(),
                money_spent: bill,
                userId,
            });
            const subMember = await this.jsonServerService.getUser(userId);
            const parent = subMember.parentId
                ? await this.jsonServerService.getUser(subMember.parentId)
                : subMember;
            const club = await this.jsonServerService.getClub(clubId);
            const clubName = club?.name || 'Unknown Club';
            if (subMember.roles === 'submember') {
                await this.jsonServerService.createNotification({
                    userId: parent.id,
                    clubId: club.id,
                    title: 'Transaction Performed By Submember',
                    body: `${subMember.fullname} submitted a transaction of $${bill} in ${clubName}. Please review it.`,
                });
                await this.jsonServerService.createNotification({
                    userId: subMember.id,
                    clubId: club.id,
                    title: 'Transaction Submitted',
                    body: `Your transaction of $${bill} in ${clubName} has been submitted for review.`,
                });
            }
            else {
                await this.jsonServerService.createNotification({
                    userId: subMember.id,
                    clubId: club.id,
                    title: 'Transaction Submitted',
                    body: `Your transaction of $${bill} in ${clubName} has been submitted.`,
                });
            }
            return {
                success: true,
                message: 'Transaction created successfully',
                data: { expense, userClub, transaction },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async findAllForSubMember(req) {
        try {
            const userId = req.user.id;
            const user = req.user;
            const transactions = await this.jsonServerService.getTransactions({
                userId,
                clubId: user.currently_at,
            });
            const pendingCharges = transactions.filter((el) => el.status === 'pending');
            return {
                data: {
                    transactions,
                    pendingApprovals: pendingCharges.length,
                    pendingCharges,
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async findAllForMember(req) {
        try {
            if (!req?.user)
                throw new Error('Unauthorized');
            const userId = toStr(req.user.id);
            const clubId = toStr(req.user.currently_at);
            const [subMembers, clubTransactions] = await Promise.all([
                this.jsonServerService.getUsers({
                    parentId: userId,
                    roles: 'submember',
                }),
                this.jsonServerService.getTransactions({ memberId: userId, clubId }),
            ]);
            const allowedUserIds = new Set([
                userId,
                ...subMembers.map((s) => toStr(s.id)),
            ]);
            const transactions = [];
            const pendingCharges = [];
            for (const tx of clubTransactions) {
                if (!allowedUserIds.has(toStr(tx.userId)))
                    continue;
                transactions.push(tx);
                if (tx.status === 'pending')
                    pendingCharges.push(tx);
            }
            return {
                success: true,
                data: {
                    transactions,
                    pendingCharges,
                    pendingApprovals: pendingCharges.length,
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error?.message ?? 'Failed to fetch transactions');
        }
    }
    async getTransactionFeed(req) {
        try {
            const user = req.user;
            const memberId = String(user.id);
            const role = user.roles;
            const clubId = String(user.currently_at);
            let transactions = [];
            if (role === 'member') {
                const [allUsers, allUserClubs, clubTx] = await Promise.all([
                    this.jsonServerService.getUsers(),
                    this.jsonServerService.getUserClubs(),
                    this.jsonServerService.getTransactions({ clubId }),
                ]);
                const allowedUserIds = new Set(allUserClubs
                    .filter((uc) => String(uc.memberId) === memberId &&
                    String(uc.clubId) === clubId)
                    .map((uc) => String(uc.userId)));
                const transactions = clubTx.filter((tx) => tx.userId && allowedUserIds.has(String(tx.userId)));
                const userById = new Map(allUsers.map((u) => [String(u.id), u]));
                const enriched = transactions.map((tx) => ({
                    ...tx,
                    userName: userById.get(String(tx.userId))?.fullname || 'Unknown',
                }));
                return this.formatMemberTransactionFeed(enriched);
            }
            else {
                const subMemberId = String(user.id);
                const subMemberUser = await this.jsonServerService.getUser(subMemberId);
                const userClubs = await this.jsonServerService.getUserClubs({
                    userId: user.id,
                    clubId,
                    memberId: memberId,
                });
                const clubTx = await this.jsonServerService.getTransactions({ clubId });
                const transactions = clubTx.filter((tx) => String(tx.userId) === subMemberId);
                const enriched = transactions.map((tx) => ({
                    ...tx,
                    userName: subMemberUser?.fullname || 'Unknown',
                }));
                return this.formatSubMemberTransactionFeed(enriched);
            }
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to fetch transaction feed');
        }
    }
    formatMemberTransactionFeed(transactions, userById) {
        const nameOf = (tx) => tx.userName || userById?.get(String(tx.userId))?.fullname || 'Unknown';
        const pendingUnverified = transactions
            .filter((tx) => tx.status === 'pending' && !tx.verifyCharge)
            .sort((a, b) => this.txTime(b) - this.txTime(a))
            .map((tx) => ({ ...tx, userName: nameOf(tx) }));
        const remaining = transactions.filter((tx) => !(tx.status === 'pending' && !tx.verifyCharge));
        const groupedTransactions = this.groupTransactionsByDay(remaining.map((tx) => ({ ...tx, userName: nameOf(tx) })));
        return {
            success: true,
            message: 'Transactions fetched successfully',
            data: {
                pendingUnverified,
                transactions: groupedTransactions,
            },
        };
    }
    formatSubMemberTransactionFeed(transactions) {
        const groupedTransactions = this.groupTransactionsByDay(transactions);
        return {
            success: true,
            message: 'Transactions fetched successfully',
            data: { transactions: groupedTransactions },
        };
    }
    groupTransactionsByDay(transactions) {
        const grouped = transactions.reduce((groups, tx) => {
            const t = tx.createdAt ?? tx.date ?? tx.updatedAt;
            const d = t ? new Date(t) : new Date(NaN);
            if (isNaN(d.getTime()))
                return groups;
            const day = d.toISOString().split('T')[0];
            if (!groups[day]) {
                groups[day] = { date: day, totalSpent: 0, items: [] };
            }
            groups[day].items.push(tx);
            groups[day].totalSpent += Number(tx.bill) || 0;
            return groups;
        }, {});
        return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    txTime(tx) {
        const t = tx.createdAt ?? tx.date ?? tx.updatedAt;
        const n = t ? new Date(t).getTime() : NaN;
        return Number.isFinite(n) ? n : 0;
    }
    async getfilertedTransactionFeed(req, filters = {}) {
        try {
            const user = req.user;
            const userId = String(user.id);
            const userRole = user.roles;
            let transactions;
            if (userRole === 'member') {
                const clubId = String(user.currently_at);
                const [allUsers, clubTransactions] = await Promise.all([
                    this.jsonServerService.getUsers(),
                    this.jsonServerService.getTransactions({ clubId }),
                ]);
                const subMembers = allUsers.filter((u) => String(u.parentId) === userId && u.roles === 'submember');
                const allowedUserIds = new Set([
                    userId,
                    ...subMembers.map((s) => String(s.id)),
                ]);
                transactions = clubTransactions.filter((tx) => allowedUserIds.has(String(tx.userId)));
            }
            else {
                transactions = await this.jsonServerService.getTransactions({
                    userId,
                    clubId: user.currently_at,
                });
            }
            if (filters.status) {
                transactions = transactions.filter((tx) => tx.status === filters.status);
            }
            if (filters.category && filters.category.length > 0) {
                transactions = transactions.filter((tx) => filters.category.includes(tx.category));
            }
            if (filters.subMemberId && userRole === 'member') {
                transactions = transactions.filter((tx) => String(tx.userId) === String(filters.subMemberId));
            }
            if (filters.dateRange) {
                console.log('Date Range: ' + filters.dateRange);
                const now = new Date();
                let startDate;
                let endDate = now;
                switch (filters.dateRange) {
                    case 'last7days':
                        startDate = new Date(now);
                        startDate.setDate(now.getDate() - 7);
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case 'thismonth':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case 'last3months':
                        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case 'custom':
                        if (filters.fromDate && filters.toDate) {
                            startDate = new Date(filters.fromDate);
                            startDate.setHours(0, 0, 0, 0);
                            endDate = new Date(filters.toDate);
                            endDate.setHours(23, 59, 59, 999);
                            console.log('Custom startDate: ' + startDate);
                            console.log('Custom endDate: ' + endDate);
                        }
                        else {
                            console.warn('Custom date range invalid, skipping date filter');
                            return transactions;
                        }
                        break;
                    default:
                        console.warn('Unknown dateRange, skipping date filter');
                }
                transactions = transactions.filter((tx) => {
                    const ts = tx.createdAt ?? tx.date ?? tx.updatedAt;
                    const txDate = new Date(ts);
                    return txDate >= startDate && txDate <= endDate;
                });
                if (filters.dateRange !== 'custom') {
                    transactions = transactions.filter((tx) => {
                        const ts = tx.createdAt ?? tx.date ?? tx.updatedAt;
                        const txDate = new Date(ts);
                        return txDate >= startDate;
                    });
                }
            }
            if (userRole === 'member') {
                const allUsers = await this.jsonServerService.getUsers();
                const userById = new Map(allUsers.map((u) => [String(u.id), u]));
                const enriched = transactions.map((tx) => ({
                    ...tx,
                    userName: userById.get(String(tx.userId))?.fullname || 'Unknown',
                }));
                const pendingUnverified = enriched.filter((tx) => tx.status === 'pending' && !tx.verifyCharge);
                const remaining = enriched.filter((tx) => !(tx.status === 'pending' && !tx.verifyCharge));
                const grouped = this.groupTransactionsByDay(remaining);
                return {
                    success: true,
                    message: 'Transactions fetched successfully',
                    data: {
                        pendingUnverified,
                        transactions: grouped,
                    },
                };
            }
            {
                const allUsers = await this.jsonServerService.getUsers();
                const userById = new Map(allUsers.map((u) => [String(u.id), u]));
                const enriched = transactions.map((tx) => ({
                    ...tx,
                    userName: userById.get(String(tx.userId))?.fullname || 'Unknown',
                }));
                return {
                    success: true,
                    message: 'Transactions fetched successfully',
                    data: {
                        transactions: this.groupTransactionsByDay(enriched),
                    },
                };
            }
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async verifyCharge(id, req) {
        try {
            const userId = req.user.id;
            const userRole = req.user.roles;
            if (userRole !== 'member') {
                throw new common_1.UnauthorizedException('Only members can verify charges');
            }
            const transaction = await this.jsonServerService.getTransaction(id);
            if (!transaction) {
                throw new common_1.BadRequestException('Transaction not found');
            }
            const memberInfo = await this.jsonServerService.getUser(userId);
            if (String(transaction.clubId) !== String(memberInfo.currently_at)) {
                throw new common_1.UnauthorizedException('You can only verify transactions in your current club');
            }
            const club = await this.jsonServerService.getClub(transaction.clubId);
            const clubName = club?.name || 'Unknown Club';
            const allUsers = await this.jsonServerService.getUsers();
            const subMembers = allUsers.filter((u) => String(u.parentId) === String(userId) && u.roles === 'submember');
            const allowedUserIds = new Set([
                String(userId),
                ...subMembers.map((s) => String(s.id)),
            ]);
            if (!allowedUserIds.has(String(transaction.userId))) {
                throw new common_1.UnauthorizedException('You can only verify charges for yourself or your sub-members');
            }
            if (transaction.verifyCharge) {
                throw new common_1.BadRequestException('Transaction is already verified');
            }
            if (transaction.status === 'pending') {
            }
            else if (transaction.status === 'refused' && transaction.flagChargeId) {
                const flagCharges = await this.jsonServerService.getFlagCharges({
                    transactionId: transaction.id,
                });
                if (flagCharges.length > 0) {
                    await this.jsonServerService.deleteFlagCharge(flagCharges[0].id);
                }
            }
            else {
                throw new common_1.BadRequestException('Only pending or flagged (refused) transactions can be verified');
            }
            const updatedTransaction = await this.jsonServerService.updateTransaction(id, {
                verifyCharge: true,
                flagChargeId: false,
                status: 'approved',
                date: transaction.date,
                createdAt: transaction.createdAt,
                updatedAt: new Date().toISOString(),
            });
            const title = 'Transaction Verified';
            const userInfo = allUsers.find((u) => String(u.id) === String(updatedTransaction.userId));
            const parentInfo = allUsers.find((u) => String(u.id) === String(userId));
            const parentBody = `You have verified the transaction of $${transaction.bill} made by ${userInfo.fullname} in ${clubName}.`;
            await this.jsonServerService.createNotification({
                userId,
                clubId: club.id,
                title,
                body: parentBody,
            });
            const childBody = `Your transaction of $${transaction.bill} has been verified by ${parentInfo.fullname} in ${clubName}.`;
            await this.jsonServerService.createNotification({
                userId: transaction.userId,
                clubId: club.id,
                title,
                body: childBody,
            });
            return {
                success: true,
                message: transaction.status === 'refused'
                    ? 'Flagged charge verified and approved'
                    : 'Charge verified successfully',
                data: {
                    ...updatedTransaction,
                    userName: userInfo?.fullname || null,
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
    remove(id) {
        return `This action removes a #${id} transaction`;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_server_service_1.JsonServerService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map