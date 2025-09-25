"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EovService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const json_server_service_1 = require("../../services/json-server.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PDFDocument = require('pdfkit');
let EovService = class EovService {
    http;
    jsonServerService;
    constructor(http, jsonServerService) {
        this.http = http;
        this.jsonServerService = jsonServerService;
    }
    async getDashboard(req) {
        try {
            const user = req.user;
            const memberId = String(user.id);
            console.log(memberId);
            if (!memberId)
                throw new common_1.BadRequestException('Missing authenticated user id');
            if ((user.roles ?? 'member') !== 'member') {
                throw new common_1.BadRequestException('EOV dashboard is only accessible to members, not sub-members.');
            }
            const subMembers = await this.fetchSubMembersForMember(memberId);
            console.log(subMembers);
            const allUserIds = [memberId, ...subMembers.map((s) => String(s.id))];
            const allUserClubs = (await Promise.all(allUserIds.map((uid) => this.jsonServerService.getUserClubs({
                userId: uid,
                clubId: user.currently_at,
            })))).flat();
            const totalAllowance = allUserClubs.reduce((sum, uc) => sum + (Number(uc.totalAllowance) || 0), 0);
            const totalSpending = allUserClubs.reduce((sum, uc) => sum + (Number(uc.totalSpent) || 0), 0);
            const remainingAllowance = totalAllowance - totalSpending;
            const allTransactions = await this.jsonServerService.getTransactions({ memberId: memberId, clubId: user.currently_at });
            const flaggedTransactions = allTransactions.filter((tx) => tx.flagChargeId);
            return {
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: {
                    flaggedChargeCount: flaggedTransactions.length,
                    totalSpending,
                    totalAllowance,
                    flaggedTransactions: flaggedTransactions,
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async getSummaryReport(memberId, period) {
        try {
            if (!memberId)
                throw new common_1.BadRequestException('Missing authenticated user id');
            const member = await this.fetchUser(memberId);
            if ((member.roles ?? 'member') !== 'member') {
                throw new common_1.BadRequestException('EOV summary is only accessible to members, not sub-members.');
            }
            const subMembers = await this.fetchSubMembersForMember(memberId);
            const allUserIds = [memberId, ...subMembers.map((s) => String(s.id))];
            const allTransactions = await this.jsonServerService.getTransactions();
            let memberTransactions = allTransactions.filter((tx) => allUserIds.includes(String(tx.userId)));
            const { filteredTransactions, periodInfo } = this.filterTransactionsByPeriod(memberTransactions, period);
            const totalSpending = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0);
            const totalAllowance = await this.calculateTotalAllowance(member, subMembers);
            const flaggedTransactions = filteredTransactions.filter((tx) => typeof tx.flagChargeId === 'string' ||
                typeof tx.flagChargeId === 'number');
            const unverifiedSpends = filteredTransactions.filter((tx) => !tx.verifyCharge &&
                !(typeof tx.flagChargeId === 'string' ||
                    typeof tx.flagChargeId === 'number'));
            const flagCharges = await this.jsonServerService.getFlagCharges();
            const memberFlagCharges = flagCharges.filter((fc) => allUserIds.includes(String(fc.userId)));
            const categoryBreakdown = this.calculateCategoryBreakdown(filteredTransactions);
            const statusBreakdown = this.calculateStatusBreakdown(filteredTransactions);
            const timeBreakdown = this.calculateTimeBreakdown(filteredTransactions, period);
            const verifiedSpends = filteredTransactions.filter((tx) => tx.status === 'approved' && tx.verifyCharge === true);
            const flaggedCharges = flaggedTransactions;
            const clubBreakdown = await this.getClubAndMemberBreakdown(member, subMembers, filteredTransactions);
            return {
                success: true,
                message: 'Summary report generated successfully',
                data: {
                    period: periodInfo,
                    summary: {
                        totalTransactions: filteredTransactions.length,
                        totalSpending,
                        totalAllowance,
                        flaggedChargeCount: memberFlagCharges.length,
                        flaggedTransactions: flaggedTransactions.length,
                    },
                    breakdown: {
                        categories: categoryBreakdown,
                        status: statusBreakdown,
                        timeBased: timeBreakdown,
                    },
                    verifiedSpends: {
                        count: verifiedSpends.length,
                        totalAmount: verifiedSpends.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0),
                        verifiedtransactions: verifiedSpends,
                    },
                    unverifiedSpends: {
                        count: unverifiedSpends.length,
                        totalAmount: unverifiedSpends.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0),
                        Unverifiedtransactions: unverifiedSpends,
                    },
                    flaggedCharges: {
                        count: flaggedCharges.length,
                        totalAmount: flaggedCharges.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0),
                        transactions: flaggedCharges,
                    },
                    clubAndMemberBreakdown: clubBreakdown,
                    subMembers: subMembers.map((sm) => ({
                        id: sm.id,
                        fullname: sm.fullname,
                        email: sm.email,
                    })),
                    transactionDetails: filteredTransactions,
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async sendEmailReport(memberId, period, autoSend) {
        try {
            if (!memberId)
                throw new common_1.BadRequestException('Missing authenticated user id');
            const member = await this.fetchUser(memberId);
            if ((member.roles ?? 'member') !== 'member') {
                throw new common_1.BadRequestException('Email reports are only accessible to members, not sub-members.');
            }
            if (!member.email) {
                throw new common_1.BadRequestException('Member has no email address on file. Please update your profile with an email address.');
            }
            const summaryReport = await this.getSummaryReport(memberId, period);
            const emailContent = this.generateEmailContent(summaryReport.data, member);
            if (autoSend === true) {
                const emailResult = await this.sendEmail(member.email, emailContent);
                return {
                    success: true,
                    message: 'Email report sent automatically',
                    data: {
                        recipient: member.email,
                        period: summaryReport.data.period,
                        sentAt: new Date().toISOString(),
                        emailId: emailResult.id,
                        autoSent: true,
                    },
                };
            }
            else {
                return {
                    success: true,
                    message: 'Email content generated successfully',
                    data: {
                        recipient: member.email,
                        period: summaryReport.data.period,
                        emailContent: emailContent,
                        autoSent: false,
                        note: 'Set autoSend: true to automatically send the email',
                    },
                };
            }
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async fetchAndGenerateReport(memberId, period) {
        if (!memberId)
            throw new common_1.BadRequestException('Missing authenticated user id');
        let member = await this.fetchUser(memberId);
        if ((member.roles ?? 'member') !== 'member') {
            const parentId = member.parentId;
            if (!parentId) {
                throw new common_1.BadRequestException('Sub-member has no parent member (parentId).');
            }
            member = await this.fetchUser(String(parentId));
            memberId = String(member.id);
        }
        const clubId = member.currently_at;
        if (!clubId) {
            throw new common_1.BadRequestException('User has no active club (currently_at is empty).');
        }
        const [club, submembers, clubTransactions, flagCharges] = await Promise.all([
            this.fetchClub(String(clubId)),
            this.fetchSubMembersForMember(memberId),
            this.fetchTransactionsForClub(String(clubId), memberId),
            this.fetchFlagChargesForMember(memberId),
        ]);
        const allUserClubs = await this.jsonServerService.getUserClubs({
            memberId,
            clubId: String(clubId),
        });
        const allowedIds = new Set([
            String(memberId),
            ...submembers.map((u) => String(u.id)),
        ]);
        const spenderIds = new Set(allowedIds);
        const usersById = new Map([
            [String(member.id), member],
            ...submembers.map((u) => [String(u.id), u]),
        ]);
        let transactions = clubTransactions.filter((t) => spenderIds.has(String(t.userId)));
        const { filteredTransactions, periodInfo } = this.filterTransactionsByPeriod(transactions, period);
        transactions = filteredTransactions;
        return this.generatePDFReport(member, club, submembers, allUserClubs, transactions, flagCharges, usersById, periodInfo);
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
    async calculateTotalAllowance(member, subMembers) {
        try {
            const allUserIds = [member.id, ...subMembers.map((sm) => sm.id)];
            const userClubs = await this.jsonServerService.getUserClubs({
                memberId: member.id,
                clubId: String(member.currently_at),
            });
            const relevantUserClubs = userClubs.filter((uc) => allUserIds.includes(uc.userId));
            const totalAllowance = userClubs.reduce((sum, uc) => sum + (uc.totalAllowance || 0), 0);
            return totalAllowance;
        }
        catch {
            return 0;
        }
    }
    calculateCategoryBreakdown(transactions) {
        return transactions.reduce((acc, tx) => {
            const category = tx.category || 'Uncategorized';
            const amount = Number(tx.bill) || 0;
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {});
    }
    calculateStatusBreakdown(transactions) {
        return transactions.reduce((acc, tx) => {
            const status = tx.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }
    async getClubAndMemberBreakdown(member, subMembers, transactions) {
        try {
            const club = await this.fetchClub(String(member.currently_at));
            const [memberClub] = await this.jsonServerService.getUserClubs({
                userId: String(member.id),
                clubId: String(member.currently_at),
            });
            const subMemberClubs = await Promise.all(subMembers.map(async (sm) => {
                const [uc] = await this.jsonServerService.getUserClubs({
                    userId: String(sm.id),
                    clubId: String(member.currently_at),
                });
                return { subMember: sm, userClub: uc };
            }));
            const memberTransactions = transactions.filter((tx) => String(tx.userId) === String(member.id) &&
                String(tx.clubId) === String(member.currently_at));
            const memberSpending = memberTransactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0);
            const subMemberBreakdown = subMemberClubs.map(({ subMember, userClub }) => {
                const subMemberTransactions = transactions.filter((tx) => String(tx.userId) === String(subMember.id) &&
                    String(tx.clubId) === String(member.currently_at));
                const subMemberSpending = subMemberTransactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0);
                return {
                    subMember: {
                        id: subMember.id,
                        fullname: subMember.fullname,
                        email: subMember.email,
                        roles: subMember.roles,
                    },
                    clubFinance: {
                        totalAllowance: userClub?.totalAllowance || 0,
                        totalSpent: userClub?.totalSpent || 0,
                        remainingAllowance: (userClub?.totalAllowance || 0) - (userClub?.totalSpent || 0),
                    },
                    transactions: {
                        count: subMemberTransactions.length,
                        totalSpent: subMemberSpending,
                        verified: subMemberTransactions.filter((tx) => tx.status === 'approved' && tx.verifyCharge === true).length,
                        flagged: subMemberTransactions.filter((tx) => tx.flagChargeId !== null && tx.flagChargeId !== undefined).length,
                    },
                };
            });
            return {
                club: {
                    id: club?.id || member.currently_at,
                    name: club?.name || 'Unknown Club',
                    location: club?.location || 'Unknown Location',
                },
                member: {
                    id: member.id,
                    fullname: member.fullname,
                    email: member.email,
                    roles: member.roles,
                    clubFinance: {
                        totalAllowance: memberClub?.totalAllowance || 0,
                        totalSpent: memberClub?.totalSpent || 0,
                        remainingAllowance: (memberClub?.totalAllowance || 0) - (memberClub?.totalSpent || 0),
                    },
                    transactions: {
                        count: memberTransactions.length,
                        totalSpent: memberSpending,
                        verified: memberTransactions.filter((tx) => tx.status === 'approved' && tx.verifyCharge === true).length,
                        flagged: memberTransactions.filter((tx) => tx.flagChargeId !== null && tx.flagChargeId !== undefined).length,
                    },
                },
                subMembers: subMemberBreakdown,
                totals: {
                    totalAllowance: (memberClub?.totalAllowance || 0) +
                        subMemberBreakdown.reduce((sum, sm) => sum + (sm.clubFinance?.totalAllowance || 0), 0),
                    totalSpent: (memberClub?.totalSpent || 0) +
                        subMemberBreakdown.reduce((sum, sm) => sum + (sm.clubFinance?.totalSpent || 0), 0),
                    totalTransactions: transactions.filter((tx) => String(tx.clubId) === String(member.currently_at)).length,
                    totalVerified: transactions.filter((tx) => String(tx.clubId) === String(member.currently_at) &&
                        tx.status === 'approved' &&
                        tx.verifyCharge === true).length,
                    totalFlagged: transactions.filter((tx) => String(tx.clubId) === String(member.currently_at) &&
                        tx.flagChargeId !== null &&
                        tx.flagChargeId !== undefined).length,
                },
            };
        }
        catch (error) {
            return {
                club: {
                    id: 'unknown',
                    name: 'Unknown Club',
                    location: 'Unknown Location',
                },
                member: {
                    id: member.id,
                    fullname: member.fullname,
                    email: member.email,
                    roles: member.roles,
                },
                subMembers: [],
                totals: {
                    totalAllowance: 0,
                    totalSpent: 0,
                    totalTransactions: 0,
                    totalVerified: 0,
                    totalFlagged: 0,
                },
            };
        }
    }
    calculateTimeBreakdown(transactions, period) {
        const breakdown = {};
        transactions.forEach((tx) => {
            const dateString = tx.createdAt || tx.date || tx.updatedAt;
            if (!dateString)
                return;
            const txDate = new Date(dateString);
            let key;
            switch (period?.toLowerCase()) {
                case 'daily':
                    key = txDate.toISOString().split('T')[0];
                    break;
                case 'weekly':
                    const startOfWeek = new Date(txDate);
                    startOfWeek.setDate(txDate.getDate() - txDate.getDay());
                    key = startOfWeek.toISOString().split('T')[0];
                    break;
                case 'monthly':
                    key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default:
                    key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
                    break;
            }
            if (!breakdown[key]) {
                breakdown[key] = {
                    date: key,
                    transactions: 0,
                    totalSpent: 0,
                    categories: {},
                    status: {},
                    flaggedCount: 0,
                };
            }
            const entry = breakdown[key];
            entry.transactions += 1;
            entry.totalSpent += Number(tx.bill) || 0;
            const category = tx.category || 'Uncategorized';
            entry.categories[category] =
                (entry.categories[category] || 0) + (Number(tx.bill) || 0);
            const status = tx.status || 'unknown';
            entry.status[status] = (entry.status[status] || 0) + 1;
            if (typeof tx.flagChargeId === 'string' ||
                typeof tx.flagChargeId === 'number') {
                entry.flaggedCount += 1;
            }
        });
        return Object.values(breakdown).sort((a, b) => {
            if (period?.toLowerCase() === 'monthly') {
                return a.date.localeCompare(b.date);
            }
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }
    generateEmailContent(reportData, member) {
        const { period, summary, breakdown } = reportData;
        const timeBreakdownSection = breakdown.timeBased && breakdown.timeBased.length > 0
            ? `
      <h3>${period.name} Breakdown</h3>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Date</th>
          <th>Transactions</th>
          <th>Total Spent</th>
        </tr>
        ${breakdown.timeBased
                .map((entry) => `
          <tr>
            <td>${entry.date}</td>
            <td>${entry.transactions}</td>
            <td>$${entry.totalSpent}</td>
          </tr>
        `)
                .join('')}
      </table>
    `
            : '';
        return `
      <h2>EOV Report - ${period.name}</h2>
      <p>Dear ${member.fullname || 'Member'},</p>
      
      <h3>Summary</h3>
      <ul>
        <li>Period: ${period.name} (${period.startDate} to ${period.endDate})</li>
        <li>Total Transactions: ${summary.totalTransactions}</li>
        <li>Total Spending: $${summary.totalSpending}</li>
        <li>Total Allowance: $${summary.totalAllowance}</li>
        <li>Flagged Charges: ${summary.flaggedChargeCount}</li>
        <li>Flagged Transactions: ${summary.flaggedTransactions}</li>
      </ul>
      
      ${timeBreakdownSection}
      
      <h3>Category Breakdown</h3>
      <ul>
        ${Object.entries(breakdown.categories)
            .map(([category, amount]) => `<li>${category}: $${amount}</li>`)
            .join('')}
      </ul>
      
      <h3>Status Breakdown</h3>
      <ul>
        ${Object.entries(breakdown.status)
            .map(([status, count]) => `<li>${status}: ${count} transactions</li>`)
            .join('')}
      </ul>
      
      <p>Generated on: ${new Date().toLocaleString()}</p>
    `;
    }
    async sendEmail(recipient, content) {
        console.log(`Sending email to: ${recipient}`);
        console.log(`Content: ${content}`);
        return {
            id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    }
    async generatePDFReport(member, club, submembers, userClubs, transactions, flagCharges, usersById, periodInfo) {
        try {
            const doc = new PDFDocument({
                margin: 40,
                info: { Title: 'Transactions Report' },
            });
            const uploadDir = path.resolve(__dirname, '..', '..', '..', 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileName = `transactions-report-${periodInfo.name.toLowerCase()}-${Date.now()}.pdf`;
            const filePath = path.join(uploadDir, fileName);
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            const left = doc.page.margins.left;
            const right = doc.page.width - doc.page.margins.right;
            const top = doc.page.margins.top;
            const bottom = doc.page.height - doc.page.margins.bottom;
            const safeMoveDown = (n = 0.5) => {
                try {
                    doc.moveDown(n);
                }
                catch {
                }
            };
            const formatCurrency = (val) => `$${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const section = (title) => {
                doc.x = doc.page.margins.left;
                doc.font('Helvetica-Bold').fontSize(14).text(title);
                doc.font('Helvetica').fontSize(11);
                safeMoveDown(0.4);
            };
            const drawTable = (opts) => {
                const { title, columns, rows, startY, gap = 6, headerFontSize = 9, rowFontSize = 8, rowPaddingY = 4, zebra = false, } = opts;
                const availableWidth = right - left;
                const naturalWidth = columns.reduce((s, c) => s + c.width, 0) + gap * (columns.length - 1);
                let scale = 1;
                if (naturalWidth > availableWidth)
                    scale =
                        (availableWidth - gap * (columns.length - 1)) /
                            (naturalWidth - gap * (columns.length - 1));
                const cols = columns.map((c) => ({
                    ...c,
                    width: Math.floor(c.width * scale),
                }));
                const xPositions = [];
                let x = left;
                for (let i = 0; i < cols.length; i++) {
                    xPositions.push(x);
                    x += cols[i].width + gap;
                }
                let y = startY ?? doc.y;
                const ensurePage = (need, redrawHeader) => {
                    if (y + need > bottom) {
                        doc.addPage();
                        y = top;
                        if (redrawHeader)
                            drawHeader();
                    }
                };
                const drawHeader = () => {
                    if (title) {
                        doc.font('Helvetica-Bold').fontSize(11).text(title, left, y);
                        y += doc.heightOfString(title, { width: availableWidth }) + 6;
                    }
                    doc.font('Helvetica-Bold').fontSize(headerFontSize);
                    let headerHeights = [];
                    for (let i = 0; i < cols.length; i++) {
                        const h = doc.heightOfString(cols[i].label, {
                            width: cols[i].width,
                            align: 'left',
                        });
                        headerHeights.push(h);
                    }
                    const headerH = Math.max(...headerHeights) + rowPaddingY * 2;
                    ensurePage(headerH + 6, false);
                    const headerY = y + rowPaddingY;
                    for (let i = 0; i < cols.length; i++) {
                        doc.text(cols[i].label, xPositions[i], headerY, {
                            width: cols[i].width,
                            align: 'left',
                        });
                    }
                    y += headerH;
                    doc.moveTo(left, y).lineTo(right, y).stroke();
                    y += 2;
                    doc.font('Helvetica').fontSize(rowFontSize);
                };
                drawHeader();
                for (let r = 0; r < rows.length; r++) {
                    const row = rows[r];
                    const heights = cols.map((c, i) => {
                        const text = (row[c.key] ?? '').toString();
                        return doc.heightOfString(text, {
                            width: c.width,
                            align: c.align ?? 'left',
                        });
                    });
                    const rowHeight = Math.max(...heights) + rowPaddingY * 2;
                    ensurePage(rowHeight, true);
                    if (zebra && r % 2 === 1) {
                        doc.save().fillColor('#F5F7FA');
                        doc.rect(left, y, availableWidth, rowHeight).fill();
                        doc.restore();
                    }
                    const textY = y + rowPaddingY;
                    for (let i = 0; i < cols.length; i++) {
                        const c = cols[i];
                        const text = (row[c.key] ?? '').toString();
                        const padding = c.align === 'right' ? 8 : 0;
                        doc.text(text, xPositions[i], textY, {
                            width: c.width - padding,
                            align: c.align ?? 'left',
                        });
                    }
                    y += rowHeight;
                }
                y += 6;
                return y;
            };
            doc.fontSize(20).text('Transactions Report', { align: 'center' });
            safeMoveDown(0.3);
            doc
                .fontSize(12)
                .fillColor('blue')
                .text(`Period: ${periodInfo.name} (${periodInfo.startDate} to ${periodInfo.endDate})`, { align: 'center' })
                .fillColor('black');
            safeMoveDown(0.3);
            doc
                .fontSize(10)
                .fillColor('gray')
                .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
                .fillColor('black');
            safeMoveDown(1);
            section('Member & Club');
            doc.text(`Member: ${member.fullname ?? member.id}`);
            doc.text(`Email:  ${member.email ?? '—'}`);
            doc.text(`Club:   ${club?.name ?? 'Unknown'} (${club?.location ?? '—'})`);
            safeMoveDown(0.8);
            section('Club Finance Summary');
            if (userClubs.length) {
                const totalAllowance = userClubs.reduce((sum, uc) => sum + (uc.totalAllowance || 0), 0);
                const totalSpent = userClubs.reduce((sum, uc) => sum + (uc.totalSpent || 0), 0);
                const remaining = totalAllowance - totalSpent;
                doc.text(`Total Allowance: ${formatCurrency(totalAllowance)}`);
                doc.text(`Total Spent:     ${formatCurrency(totalSpent)}`);
                doc.text(`Remaining:       ${formatCurrency(remaining || 0)}`);
            }
            else {
                doc.fontSize(10).text('No user_club record found for this member.');
            }
            safeMoveDown(0.8);
            section('Sub-members');
            if (!submembers.length) {
                doc.fontSize(10).text('No sub-members.');
            }
            else {
                submembers.forEach((s, i) => {
                    const uc = userClubs.find((uc) => uc.userId === s.id && uc.clubId === club?.id);
                    const allowance = uc ? formatCurrency(uc.totalAllowance || 0) : 'N/A';
                    const spent = uc ? formatCurrency(uc.totalSpent || 0) : 'N/A';
                    const remaining = uc && typeof uc.totalAllowance === 'number'
                        ? formatCurrency((uc.totalAllowance || 0) - (uc.totalSpent || 0))
                        : 'N/A';
                    const startY = doc.y;
                    doc
                        .rect(doc.page.margins.left, startY, doc.page.width - 80, 55)
                        .fill('#f7f7f7')
                        .stroke();
                    doc.fillColor('black').fontSize(11);
                    doc.text(`${i + 1}. ${s.fullname ?? s.id}`, 50, startY + 8, {
                        continued: true,
                        bold: true,
                    });
                    doc
                        .fontSize(10)
                        .fillColor('#444')
                        .text(` • ${s.email ?? '—'}`);
                    doc.moveDown(0.3);
                    doc
                        .fontSize(10)
                        .fillColor('black')
                        .text(`   Allowance: ${allowance}`)
                        .text(`   Spent: ${spent}`)
                        .text(`   Remaining: ${remaining}`);
                    doc.moveDown(0.5).fillColor('black');
                });
            }
            safeMoveDown(1);
            section('Period Summary');
            doc.text(`Period: ${periodInfo.name}`);
            doc.text(`Date Range: ${periodInfo.startDate} to ${periodInfo.endDate}`);
            doc.text(`Transactions in Period: ${transactions.length}`);
            const totalBill = transactions.reduce((s, t) => s + (Number(t?.bill) || 0), 0);
            doc.text(`Total Spending: ${formatCurrency(totalBill)}`);
            safeMoveDown(0.8);
            const approved = transactions.filter((t) => t?.status === 'approved').length;
            const refused = transactions.filter((t) => t?.status === 'refused').length;
            const pending = transactions.filter((t) => t?.status === 'pending').length;
            section('Status Breakdown');
            doc.text(`Approved: ${approved}`);
            doc.text(`Refused:  ${refused}`);
            doc.text(`Pending:  ${pending}`);
            safeMoveDown(0.8);
            const categoryTotals = transactions.reduce((acc, t) => {
                const amt = Number(t.bill) || 0;
                acc[t.category] = (acc[t.category] ?? 0) + amt;
                return acc;
            }, {});
            section('Category Breakdown');
            const cats = Object.entries(categoryTotals);
            if (!cats.length) {
                doc.fontSize(10).text('No categories to show.');
            }
            else {
                cats.forEach(([cat, amount]) => doc.text(`- ${cat}: ${formatCurrency(amount)}`));
            }
            safeMoveDown(1);
            section('Transactions (Detailed)');
            const normalTx = transactions.filter((t) => t?.status !== 'refused' &&
                !(typeof t.flagChargeId === 'string' ||
                    typeof t.flagChargeId === 'number'));
            if (!normalTx.length) {
                doc.fontSize(10).text('No normal transactions found for this period.');
            }
            else {
                const txRows = normalTx.map((t) => {
                    const u = usersById.get(String(t.userId));
                    const spender = u
                        ? `${u.fullname ?? u.id}${u.email ? `\n${u.email}` : ''}`
                        : `Unknown (${t.userId})`;
                    return {
                        id: String(t.id),
                        club: club?.name ?? '—',
                        category: t.category ?? '—',
                        bill: formatCurrency(Number(t.bill) || 0),
                        status: t.status ?? '—',
                        verified: t.verifyCharge ? 'Yes' : 'No',
                        spender,
                    };
                });
                const txCols = [
                    { key: 'id', label: 'Txn ID', width: 90 },
                    { key: 'club', label: 'Club', width: 110 },
                    { key: 'category', label: 'Category', width: 95 },
                    { key: 'bill', label: 'Bill', width: 60, align: 'right' },
                    { key: 'status', label: 'Status', width: 80 },
                    { key: 'verified', label: 'Verified', width: 70 },
                    { key: 'spender', label: 'Spender', width: 140 },
                ];
                const nextY = drawTable({
                    columns: txCols,
                    rows: txRows,
                    startY: doc.y,
                    zebra: true,
                });
                doc.y = nextY;
            }
            safeMoveDown(1);
            doc.fontSize(10).fillColor('black');
            section('Flagged Charges');
            const flaggedSpends = transactions.filter((t) => t?.status === 'refused' ||
                typeof t.flagChargeId === 'string' ||
                typeof t.flagChargeId === 'number');
            if (!flaggedSpends.length) {
                doc.fontSize(10).text('No flagged charges.');
            }
            else {
                const flagCols = [
                    { key: 'id', label: 'Txn ID', width: 90 },
                    { key: 'category', label: 'Category', width: 110 },
                    { key: 'bill', label: 'Bill', width: 60, align: 'right' },
                    { key: 'status', label: 'Status', width: 80 },
                    { key: 'flagId', label: 'Flag ID', width: 90 },
                    { key: 'flaggedBy', label: 'Flagged By', width: 160 },
                ];
                flaggedSpends.forEach((t, idx) => {
                    const fc = flagCharges.find((f) => String(f.id) === String(t.flagChargeId));
                    const flaggedByUser = fc
                        ? usersById.get(String(fc.userId))
                        : undefined;
                    const flaggedBy = flaggedByUser
                        ? `${flaggedByUser.fullname ?? flaggedByUser.id}${flaggedByUser.email ? `\n${flaggedByUser.email}` : ''}`
                        : `Unknown (${fc?.userId ?? '—'})`;
                    const row = {
                        id: String(t.id),
                        category: String(t.category ?? '—'),
                        bill: formatCurrency(Number(t.bill) || 0),
                        status: String(t.status ?? '—'),
                        flagId: String(t.flagChargeId ?? '—'),
                        flaggedBy,
                    };
                    const nextY = drawTable({
                        columns: flagCols,
                        rows: [row],
                        startY: doc.y,
                        zebra: true,
                    });
                    doc.y = nextY + 4;
                    doc.x = doc.page.margins.left;
                    doc.fontSize(8).fillColor('#444');
                    if (fc?.comment)
                        doc.text(`• Comment: ${fc.comment}`, { indent: 20 });
                    if (fc?.reasons) {
                        const reasons = Array.isArray(fc.reasons) ? fc.reasons : [fc.reasons];
                        if (reasons.length > 0) {
                            doc.text(`• Reasons: ${reasons.join(', ')}`, { indent: 20 });
                        }
                    }
                    const spenderEmail = usersById.get(String(t.userId))?.email;
                    if (spenderEmail)
                        doc.text(`• Spender Email: ${spenderEmail}`, { indent: 20 });
                    doc.fontSize(10).fillColor('black');
                });
            }
            safeMoveDown(2);
            doc
                .fontSize(9)
                .fillColor('gray')
                .text('End of report', { align: 'center' })
                .fillColor('black');
            doc.end();
            await new Promise((resolve, reject) => {
                stream.on('finish', () => resolve());
                stream.on('error', reject);
            });
            return { success: true, link: `/uploads/${fileName}` };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async fetchUser(userId) {
        try {
            const user = await this.jsonServerService.getUser(userId);
            if (!user || !user.id)
                throw new common_1.NotFoundException('User not found');
            return user;
        }
        catch {
            throw new common_1.InternalServerErrorException('Failed to load user');
        }
    }
    async fetchSubMembersForMember(memberId) {
        try {
            const users = await this.jsonServerService.getUsers({
                parentId: memberId,
                roles: 'submember',
            });
            return users;
        }
        catch {
            try {
                const allUsers = await this.jsonServerService.getUsers();
                return allUsers.filter((u) => String(u.parentId) === String(memberId) &&
                    u.roles === 'submember');
            }
            catch {
                throw new common_1.InternalServerErrorException('Failed to load sub-members');
            }
        }
    }
    async fetchClub(clubId) {
        try {
            const club = await this.jsonServerService.getClub(clubId);
            return club ?? null;
        }
        catch {
            return null;
        }
    }
    async fetchFinance(userId, clubId) {
        if (!userId || !clubId)
            return null;
        try {
            const [userClub] = await this.jsonServerService.getUserClubs({
                userId,
                clubId,
            });
            if (!userClub)
                return null;
            return {
                totalAllowance: userClub.totalAllowance ?? 0,
                totalSpent: userClub.totalSpent ?? 0,
            };
        }
        catch {
            return null;
        }
    }
    async fetchTransactionsForClub(clubId, memberId) {
        try {
            const transactions = await this.jsonServerService.getTransactions({
                clubId,
                memberId,
            });
            return transactions;
        }
        catch {
            throw new common_1.InternalServerErrorException('Failed to load transactions');
        }
    }
    async fetchFlagChargesForMember(memberId) {
        try {
            const flagCharges = await this.jsonServerService.getFlagCharges({
                userId: memberId,
            });
            return flagCharges;
        }
        catch {
            try {
                const allFlagCharges = await this.jsonServerService.getFlagCharges();
                return allFlagCharges.filter((f) => String(f.userId) === String(memberId));
            }
            catch {
                throw new common_1.InternalServerErrorException('Failed to load flag charges');
            }
        }
    }
};
exports.EovService = EovService;
exports.EovService = EovService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        json_server_service_1.JsonServerService])
], EovService);
//# sourceMappingURL=eov.service.js.map