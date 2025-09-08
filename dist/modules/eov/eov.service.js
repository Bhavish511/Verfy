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
exports.EovService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const stream_1 = require("stream");
const json_server_service_1 = require("../../services/json-server.service");
const PDFDocument = require('pdfkit');
let EovService = class EovService {
    http;
    jsonServerService;
    api = 'http://localhost:3001';
    constructor(http, jsonServerService) {
        this.http = http;
        this.jsonServerService = jsonServerService;
    }
    async getDashboard(memberId) {
        try {
            if (!memberId)
                throw new common_1.BadRequestException('Missing authenticated user id');
            const member = await this.fetchUser(memberId);
            if ((member.roles ?? 'member') !== 'member') {
                throw new common_1.BadRequestException('EOV dashboard is only accessible to members, not sub-members.');
            }
            const subMembers = await this.fetchSubMembersForMember(memberId);
            const allUserIds = [memberId, ...subMembers.map(s => String(s.id))];
            const allTransactions = await this.jsonServerService.getTransactions();
            const memberTransactions = allTransactions.filter(tx => allUserIds.includes(String(tx.userId)));
            const totalSpending = memberTransactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0);
            const memberFinance = member.financeId ? await this.jsonServerService.getFinance(member.financeId) : null;
            const subMemberFinances = await Promise.all(subMembers.map(sm => sm.financeId ? this.jsonServerService.getFinance(sm.financeId) : null));
            const totalAllowance = (memberFinance?.totalAllowance || 0) +
                subMemberFinances.reduce((sum, finance) => sum + (finance?.totalAllowance || 0), 0);
            const flaggedTransactions = memberTransactions.filter(tx => tx.flagChargeId !== null && tx.flagChargeId !== undefined);
            const flagCharges = await this.jsonServerService.getFlagCharges();
            const memberFlagCharges = flagCharges.filter(fc => allUserIds.includes(String(fc.userId)));
            return {
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: {
                    flaggedChargeCount: memberFlagCharges.length,
                    totalSpending,
                    totalAllowance,
                    flaggedTransactions: flaggedTransactions
                }
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
            const allUserIds = [memberId, ...subMembers.map(s => String(s.id))];
            const allTransactions = await this.jsonServerService.getTransactions();
            let memberTransactions = allTransactions.filter(tx => allUserIds.includes(String(tx.userId)));
            const { filteredTransactions, periodInfo } = this.filterTransactionsByPeriod(memberTransactions, period);
            const totalSpending = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0);
            const totalAllowance = await this.calculateTotalAllowance(member, subMembers);
            const flaggedTransactions = filteredTransactions.filter(tx => tx.flagChargeId !== null && tx.flagChargeId !== undefined);
            const flagCharges = await this.jsonServerService.getFlagCharges();
            const memberFlagCharges = flagCharges.filter(fc => allUserIds.includes(String(fc.userId)));
            const categoryBreakdown = this.calculateCategoryBreakdown(filteredTransactions);
            const statusBreakdown = this.calculateStatusBreakdown(filteredTransactions);
            const timeBreakdown = this.calculateTimeBreakdown(filteredTransactions, period);
            const verifiedSpends = filteredTransactions.filter(tx => tx.status === 'approved' && tx.verifyCharge === true);
            const flaggedCharges = filteredTransactions.filter(tx => tx.flagChargeId !== null && tx.flagChargeId !== undefined);
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
                        flaggedTransactions: flaggedTransactions.length
                    },
                    breakdown: {
                        categories: categoryBreakdown,
                        status: statusBreakdown,
                        timeBased: timeBreakdown
                    },
                    verifiedSpends: {
                        count: verifiedSpends.length,
                        totalAmount: verifiedSpends.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0),
                        transactions: verifiedSpends
                    },
                    flaggedCharges: {
                        count: flaggedCharges.length,
                        totalAmount: flaggedCharges.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0),
                        transactions: flaggedCharges
                    },
                    clubAndMemberBreakdown: clubBreakdown,
                    subMembers: subMembers.map(sm => ({
                        id: sm.id,
                        fullname: sm.fullname,
                        email: sm.email
                    })),
                }
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
                        autoSent: true
                    }
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
                        note: 'Set autoSend: true to automatically send the email'
                    }
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
            if (!parentId)
                throw new common_1.BadRequestException('Sub-member has no parent member (parentId).');
            member = await this.fetchUser(String(parentId));
            memberId = String(member.id);
        }
        const clubId = member.currently_at;
        if (clubId === null || clubId === undefined || clubId === '') {
            throw new common_1.BadRequestException('User has no active club (currently_at is empty).');
        }
        const [club, submembers, finance, clubTransactions, flagCharges] = await Promise.all([
            this.fetchClub(String(clubId)),
            this.fetchSubMembersForMember(memberId),
            this.fetchFinance(String(member.financeId ?? '')),
            this.fetchTransactionsForClub(String(clubId)),
            this.fetchFlagChargesForMember(memberId),
        ]);
        const spenderIds = new Set([
            String(memberId),
            ...submembers.map((u) => String(u.id)),
        ]);
        const usersById = new Map([
            [String(member.id), member],
            ...submembers.map((u) => [String(u.id), u]),
        ]);
        let transactions = clubTransactions.filter((t) => spenderIds.has(String(t.userId)));
        const { filteredTransactions, periodInfo } = this.filterTransactionsByPeriod(transactions, period);
        transactions = filteredTransactions;
        return this.generatePDFReport(member, club, submembers, finance, transactions, flagCharges, usersById, periodInfo);
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
                    endDate: now.toISOString().split('T')[0]
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
                    endDate: now.toISOString().split('T')[0]
                };
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                periodInfo = {
                    name: 'Monthly',
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: now.toISOString().split('T')[0]
                };
                break;
            default:
                periodInfo = {
                    name: 'All Time',
                    startDate: 'N/A',
                    endDate: now.toISOString().split('T')[0]
                };
                return { filteredTransactions: transactions, periodInfo };
        }
        const filteredTransactions = transactions.filter(tx => {
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
            const memberFinance = member.financeId ? await this.jsonServerService.getFinance(member.financeId) : null;
            const subMemberFinances = await Promise.all(subMembers.map(sm => sm.financeId ? this.jsonServerService.getFinance(sm.financeId) : null));
            const memberAllowance = memberFinance?.totalAllowance || 0;
            const subMemberAllowance = subMemberFinances.reduce((sum, finance) => sum + (finance?.totalAllowance || 0), 0);
            return memberAllowance + subMemberAllowance;
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
            const memberFinance = member.financeId ? await this.fetchFinance(String(member.financeId)) : null;
            const subMemberFinances = await Promise.all(subMembers.map(async (sm) => {
                const finance = sm.financeId ? await this.fetchFinance(String(sm.financeId)) : null;
                return {
                    subMember: sm,
                    finance: finance
                };
            }));
            const memberTransactions = transactions.filter(tx => String(tx.userId) === String(member.id));
            const memberSpending = memberTransactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0);
            const subMemberBreakdown = subMemberFinances.map(({ subMember, finance }) => {
                const subMemberTransactions = transactions.filter(tx => String(tx.userId) === String(subMember.id));
                const subMemberSpending = subMemberTransactions.reduce((sum, tx) => sum + (Number(tx.bill) || 0), 0);
                return {
                    subMember: {
                        id: subMember.id,
                        fullname: subMember.fullname,
                        email: subMember.email,
                        roles: subMember.roles
                    },
                    finance: {
                        totalAllowance: finance?.totalAllowance || 0,
                        totalSpent: finance?.totalSpent || 0,
                        remainingAllowance: (finance?.totalAllowance || 0) - (finance?.totalSpent || 0)
                    },
                    transactions: {
                        count: subMemberTransactions.length,
                        totalSpent: subMemberSpending,
                        verified: subMemberTransactions.filter(tx => tx.status === 'approved' && tx.verifyCharge === true).length,
                        flagged: subMemberTransactions.filter(tx => tx.flagChargeId !== null && tx.flagChargeId !== undefined).length
                    }
                };
            });
            return {
                club: {
                    id: club?.id || member.currently_at,
                    name: club?.name || 'Unknown Club',
                    location: club?.location || 'Unknown Location'
                },
                member: {
                    id: member.id,
                    fullname: member.fullname,
                    email: member.email,
                    roles: member.roles,
                    finance: {
                        totalAllowance: memberFinance?.totalAllowance || 0,
                        totalSpent: memberFinance?.totalSpent || 0,
                        remainingAllowance: (memberFinance?.totalAllowance || 0) - (memberFinance?.totalSpent || 0)
                    },
                    transactions: {
                        count: memberTransactions.length,
                        totalSpent: memberSpending,
                        verified: memberTransactions.filter(tx => tx.status === 'approved' && tx.verifyCharge === true).length,
                        flagged: memberTransactions.filter(tx => tx.flagChargeId !== null && tx.flagChargeId !== undefined).length
                    }
                },
                subMembers: subMemberBreakdown,
                totals: {
                    totalAllowance: (memberFinance?.totalAllowance || 0) +
                        subMemberFinances.reduce((sum, { finance }) => sum + (finance?.totalAllowance || 0), 0),
                    totalSpent: memberSpending +
                        subMemberBreakdown.reduce((sum, sm) => sum + sm.transactions.totalSpent, 0),
                    totalTransactions: transactions.length,
                    totalVerified: transactions.filter(tx => tx.status === 'approved' && tx.verifyCharge === true).length,
                    totalFlagged: transactions.filter(tx => tx.flagChargeId !== null && tx.flagChargeId !== undefined).length
                }
            };
        }
        catch (error) {
            return {
                club: { id: 'unknown', name: 'Unknown Club', location: 'Unknown Location' },
                member: { id: member.id, fullname: member.fullname, email: member.email, roles: member.roles },
                subMembers: [],
                totals: { totalAllowance: 0, totalSpent: 0, totalTransactions: 0, totalVerified: 0, totalFlagged: 0 }
            };
        }
    }
    calculateTimeBreakdown(transactions, period) {
        const breakdown = {};
        transactions.forEach(tx => {
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
                    flaggedCount: 0
                };
            }
            const entry = breakdown[key];
            entry.transactions += 1;
            entry.totalSpent += Number(tx.bill) || 0;
            const category = tx.category || 'Uncategorized';
            entry.categories[category] = (entry.categories[category] || 0) + (Number(tx.bill) || 0);
            const status = tx.status || 'unknown';
            entry.status[status] = (entry.status[status] || 0) + 1;
            if (tx.flagChargeId !== null && tx.flagChargeId !== undefined) {
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
        const timeBreakdownSection = breakdown.timeBased && breakdown.timeBased.length > 0 ? `
      <h3>${period.name} Breakdown</h3>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Date</th>
          <th>Transactions</th>
          <th>Total Spent</th>
          <th>Flagged</th>
        </tr>
        ${breakdown.timeBased.map((entry) => `
          <tr>
            <td>${entry.date}</td>
            <td>${entry.transactions}</td>
            <td>$${entry.totalSpent}</td>
            <td>${entry.flaggedCount}</td>
          </tr>
        `).join('')}
      </table>
    ` : '';
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
        ${Object.entries(breakdown.categories).map(([category, amount]) => `<li>${category}: $${amount}</li>`).join('')}
      </ul>
      
      <h3>Status Breakdown</h3>
      <ul>
        ${Object.entries(breakdown.status).map(([status, count]) => `<li>${status}: ${count} transactions</li>`).join('')}
      </ul>
      
      <p>Generated on: ${new Date().toLocaleString()}</p>
    `;
    }
    async sendEmail(recipient, content) {
        console.log(`Sending email to: ${recipient}`);
        console.log(`Content: ${content}`);
        return {
            id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
    async generatePDFReport(member, club, submembers, finance, transactions, flagCharges, usersById, periodInfo) {
        const stream = new stream_1.PassThrough();
        const doc = new PDFDocument({ margin: 40, info: { Title: 'Transactions Report' } });
        doc.pipe(stream);
        const safeMoveDown = (n = 0.5) => {
            try {
                doc.moveDown(n);
            }
            catch { }
        };
        doc.fontSize(20).text('Transactions Report', { align: 'center' });
        safeMoveDown(0.3);
        doc.fontSize(12).fillColor('blue')
            .text(`Period: ${periodInfo.name} (${periodInfo.startDate} to ${periodInfo.endDate})`, { align: 'center' })
            .fillColor('black');
        safeMoveDown(0.3);
        doc.fontSize(10).fillColor('gray')
            .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
            .fillColor('black');
        safeMoveDown(1);
        const section = (title) => {
            doc.font('Helvetica-Bold').fontSize(14).text(title);
            doc.font('Helvetica').fontSize(11);
            safeMoveDown(0.4);
        };
        section('Member & Club');
        doc.text(`Member: ${member.fullname ?? member.id}`);
        doc.text(`Email:  ${member.email ?? '—'}`);
        doc.text(`Club:   ${club?.name ?? 'Unknown'} (${club?.location ?? '—'})`);
        safeMoveDown(0.8);
        if (finance) {
            section('Finance Summary');
            doc.text(`Total Allowance: ${finance.totalAllowance ?? 0}`);
            doc.text(`Total Spent:     ${finance.totalSpent ?? 0}`);
            safeMoveDown(0.8);
        }
        section('Sub-members');
        if (!submembers.length) {
            doc.fontSize(10).text('No sub-members.');
        }
        else {
            submembers.forEach((s, i) => {
                doc.text(`${i + 1}. ${s.fullname ?? s.id}  •  ${s.email ?? '—'}`);
            });
        }
        safeMoveDown(1);
        section('Period Summary');
        doc.text(`Period: ${periodInfo.name}`);
        doc.text(`Date Range: ${periodInfo.startDate} to ${periodInfo.endDate}`);
        doc.text(`Transactions in Period: ${transactions.length}`);
        const totalBill = transactions.reduce((s, t) => s + (Number(t?.bill) || 0), 0);
        doc.text(`Total Spending: ${totalBill}`);
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
            cats.forEach(([cat, amount]) => doc.text(`- ${cat}: ${amount}`));
        }
        safeMoveDown(1);
        const timeBreakdown = this.calculateTimeBreakdown(transactions, periodInfo.name.toLowerCase());
        if (timeBreakdown.length > 0) {
            section(`${periodInfo.name} Breakdown`);
            doc.fontSize(10);
            timeBreakdown.forEach((entry, idx) => {
                doc.text(`${idx + 1}. ${entry.date}: ${entry.transactions} transactions, $${entry.totalSpent} spent, ${entry.flaggedCount} flagged`);
                safeMoveDown(0.2);
            });
            safeMoveDown(0.8);
        }
        section('Transactions (Detailed)');
        if (!transactions.length) {
            doc.fontSize(10).text('No transactions found for this period.');
        }
        else {
            doc.fontSize(10);
            const pageBottom = () => (Number(doc.page?.height) || 842) - 80;
            transactions.forEach((t, idx) => {
                const spender = usersById.get(String(t.userId));
                const spenderLine = spender
                    ? `${spender.fullname ?? spender.id} / ${spender.email ?? '—'} / ${spender.roles ?? '—'}`
                    : `Unknown (${t.userId})`;
                const line = `${idx + 1}. ` +
                    `Txn: ${t.id} | Club: ${t.clubId} | Category: ${t.category} | ` +
                    `Bill: ${t.bill} | Status: ${t.status} | Verified: ${t.verifyCharge ? 'Yes' : 'No'} | ` +
                    `Flag: ${t.flagChargeId ?? ''}\n` +
                    `    Spender: ${spenderLine}`;
                doc.text(line);
                safeMoveDown(0.2);
                try {
                    if (Number(doc.y) > pageBottom())
                        doc.addPage();
                }
                catch { }
            });
        }
        safeMoveDown(1.2);
        section('Flagged Charges');
        if (!flagCharges.length) {
            doc.fontSize(10).text('No flagged charges.');
        }
        else {
            flagCharges.forEach((f, idx) => {
                doc.fontSize(11).text(`#${idx + 1} (ID: ${f.id})  Owner: ${f.userId}`);
                doc.fontSize(10).text(`Comment: ${f.comment}`);
                if (Array.isArray(f.reasons) && f.reasons.length) {
                    doc.text(`Reasons: ${f.reasons.join(', ')}`);
                }
                safeMoveDown(0.3);
                try {
                    const bottom = (Number(doc.page?.height) || 842) - 80;
                    if (Number(doc.y) > bottom)
                        doc.addPage();
                }
                catch { }
            });
        }
        safeMoveDown(2);
        doc.fontSize(9).fillColor('gray').text('End of report', { align: 'center' }).fillColor('black');
        doc.end();
        return new common_1.StreamableFile(stream, {
            type: 'application/pdf',
            disposition: `attachment; filename="transactions-report-${periodInfo.name.toLowerCase()}.pdf"`,
        });
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
            const users = await this.jsonServerService.getUsers({ parentId: memberId, roles: 'submember' });
            return users;
        }
        catch {
            try {
                const allUsers = await this.jsonServerService.getUsers();
                return allUsers.filter((u) => String(u.parentId) === String(memberId) && u.roles === 'submember');
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
    async fetchFinance(financeId) {
        if (!financeId)
            return null;
        try {
            const finance = await this.jsonServerService.getFinance(financeId);
            return finance ?? null;
        }
        catch {
            return null;
        }
    }
    async fetchTransactionsForClub(clubId) {
        try {
            const transactions = await this.jsonServerService.getTransactions({ clubId });
            return transactions;
        }
        catch {
            throw new common_1.InternalServerErrorException('Failed to load transactions');
        }
    }
    async fetchFlagChargesForMember(memberId) {
        try {
            const flagCharges = await this.jsonServerService.getFlagCharges({ userId: memberId });
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