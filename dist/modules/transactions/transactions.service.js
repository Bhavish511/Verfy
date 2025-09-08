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
function toStr(v) { return String(v); }
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
            const transactions = await this.jsonServerService.getTransactions({ clubId });
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
    async create({ category, bill }, id, req) {
        try {
            const userId = req.user.id;
            const user = await this.jsonServerService.getUser(userId);
            const finance = await this.jsonServerService.getFinance(user.financeId);
            if (finance.totalSpent + bill > finance.totalAllowance)
                throw new common_1.BadRequestException('Total Amount Exceeded!');
            const expense = await this.jsonServerService.createDailyExpense({
                createdAt: Date.now(),
                money_spent: bill,
                userId,
            });
            const newFinance = await this.jsonServerService.updateFinance(user.financeId, {
                totalSpent: finance.totalSpent + bill,
                category,
            });
            const transaction = await this.jsonServerService.createTransaction({
                clubId: id,
                bill: bill,
                userId: 1,
                category: category,
                status: 'pending',
                verifyCharge: false,
                flagChargeId: null,
            });
            return {
                success: true,
                data: { expense, finance: newFinance, transaction },
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
                this.jsonServerService.getUsers({ parentId: userId, roles: 'submember' }),
                this.jsonServerService.getTransactions({ clubId }),
            ]);
            const allowedUserIds = new Set([userId, ...subMembers.map((s) => toStr(s.id))]);
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
    async getTransactionsByCategory(category) {
        const transactions = await this.jsonServerService.getTransactions({ category });
        return transactions;
    }
    async getTransactionFeed(req) {
        try {
            const user = req.user;
            const memberId = String(user.id);
            const role = user.roles;
            const clubId = String(user.currently_at);
            let transactions = [];
            if (role === 'member') {
                const [allUsers, clubTx] = await Promise.all([
                    this.jsonServerService.getUsers(),
                    this.jsonServerService.getTransactions({ clubId }),
                ]);
                const subMembers = allUsers.filter((u) => String(u.parentId) === memberId && u.roles === 'submember');
                const subMemberIds = new Set(subMembers.map((s) => String(s.id)));
                transactions = clubTx.filter((tx) => String(tx.userId) === memberId ||
                    (tx.userId && subMemberIds.has(String(tx.userId))));
                const userById = new Map(allUsers.map((u) => [String(u.id), u]));
                const enriched = transactions.map((tx) => ({
                    ...tx,
                    userName: userById.get(String(tx.userId))?.fullname || 'Unknown',
                }));
                return this.formatMemberTransactionFeed(enriched);
            }
            else {
                const subMemberId = String(user.id);
                const [allUsers, clubTx] = await Promise.all([
                    this.jsonServerService.getUsers(),
                    this.jsonServerService.getTransactions({ clubId }),
                ]);
                transactions = clubTx.filter((tx) => String(tx.userId) === subMemberId);
                const userById = new Map(allUsers.map((u) => [String(u.id), u]));
                const enriched = transactions.map((tx) => ({
                    ...tx,
                    userName: userById.get(String(tx.userId))?.fullname || 'Unknown',
                }));
                return this.formatSubMemberTransactionFeed(enriched);
            }
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to fetch transaction feed');
        }
    }
    formatMemberTransactionFeed(transactions, userById) {
        const nameOf = (tx) => tx.userName ||
            userById?.get(String(tx.userId))?.fullname ||
            'Unknown';
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
                const subMembers = allUsers.filter((u) => String(u.userId) === userId && u.roles === 'submember');
                const allowedUserIds = new Set([
                    userId,
                    ...subMembers.map((s) => String(s.id)),
                ]);
                transactions = clubTransactions.filter((tx) => allowedUserIds.has(String(tx.userId)));
            }
            else {
                transactions = await this.jsonServerService.getTransactions({
                    userId,
                    clubId: user.currently_at
                });
            }
            if (filters.status) {
                transactions = transactions.filter((tx) => tx.status === filters.status);
            }
            if (filters.category) {
                transactions = transactions.filter((tx) => tx.category === filters.category);
            }
            if (filters.subMemberId && userRole === 'member') {
                transactions = transactions.filter((tx) => String(tx.userId) === String(filters.subMemberId));
            }
            if (filters.dateRange) {
                const now = new Date();
                let startDate = new Date();
                switch (filters.dateRange) {
                    case 'last7days':
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'thismonth':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'last3months':
                        startDate.setMonth(now.getMonth() - 3);
                        break;
                    case 'custom':
                        if (filters.fromDate && filters.toDate) {
                            startDate = new Date(filters.fromDate);
                            const endDate = new Date(filters.toDate);
                            transactions = transactions.filter((tx) => {
                                const txDate = new Date(tx.createdAt);
                                return txDate >= startDate && txDate <= endDate;
                            });
                        }
                        break;
                }
                if (filters.dateRange !== 'custom') {
                    transactions = transactions.filter((tx) => {
                        const txDate = new Date(tx.createdAt);
                        return txDate >= startDate;
                    });
                }
            }
            const groupedTransactions = transactions.reduce((groups, transaction) => {
                const date = new Date(transaction.createdAt).toISOString().split('T')[0];
                if (!groups[date]) {
                    groups[date] = {
                        date,
                        transactions: [],
                        totalSpent: 0
                    };
                }
                groups[date].transactions.push(transaction);
                groups[date].totalSpent += Number(transaction.bill) || 0;
                return groups;
            }, {});
            const feedData = Object.values(groupedTransactions).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const appliedFilters = Object.keys(filters).filter(key => filters[key] !== undefined && filters[key] !== null && filters[key] !== '');
            const filtersCount = appliedFilters.length;
            return {
                success: true,
                message: 'Transaction feed retrieved successfully',
                data: {
                    transactionsByDay: feedData,
                    totalTransactions: transactions.length,
                    totalSpent: transactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0),
                    filtersApplied: filtersCount,
                    appliedFilters: appliedFilters
                }
            };
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
            console.log(transaction);
            const allUsers = await this.jsonServerService.getUsers();
            const subMembers = allUsers.filter((u) => String(u.parentId) === String(userId) && u.roles === 'submember');
            const allowedUserIds = new Set([
                String(userId),
                ...subMembers.map((s) => String(s.id)),
            ]);
            if (!allowedUserIds.has(String(transaction.userId))) {
                throw new common_1.UnauthorizedException('You can only verify charges for yourself or your sub-members');
            }
            if (transaction.status !== 'pending') {
                throw new common_1.BadRequestException('Only pending transactions can be verified');
            }
            if (transaction.verifyCharge) {
                throw new common_1.BadRequestException('Transaction is already verified');
            }
            const updatedTransaction = await this.jsonServerService.updateTransaction(id, {
                verifyCharge: true,
                status: 'approved',
                updatedAt: new Date().toISOString()
            });
            return {
                success: true,
                message: 'Charge verified successfully',
            };
        }
        catch (error) {
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