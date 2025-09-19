import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PassThrough } from 'stream';
import { JsonServerService } from '../../services/json-server.service';
import * as fs from 'fs';
import * as path from 'path';
import { uploadPath } from '../../utils/uploadFileHandler'; // use your existing uploadPath

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

type User = {
  id: string | number;
  fullname?: string;
  email?: string;
  roles?: 'member' | 'submember' | string;
  parentId?: string | number | null; // for submember, parent member id
  financeId?: string | number;
  currently_at?: number | string | null;
};

type Club = {
  id: string | number;
  name?: string;
  location?: string;
  userId?: string | number;
};

type UserClub = {
  id: string;
  userId: string;
  clubId: string;
  billingCycle: string;
  memberId: string;
  totalAllowance: number;
  totalSpent: number;
};

type Transaction = {
  id: string;
  clubId: number | string;
  bill: number;
  userId: number | string; // spender id (member or submember)
  memberId?: number | string;
  category: string;
  status: 'approved' | 'refused' | 'pending';
  verifyCharge: boolean;
  flagChargeId: string | number | boolean | null;
  createdAt?: string;
  date?: string;
  updatedAt?: string;
};

type FlagCharge = {
  id: string;
  comment: string;
  userId: number | string; // owner member id
  reasons: string[];
};

@Injectable()
export class EovService {
  constructor(
    private readonly http: HttpService,
    private readonly jsonServerService: JsonServerService,
  ) {}

  async getDashboard(memberId: string) {
    try {
      if (!memberId)
        throw new BadRequestException('Missing authenticated user id');

      // 1) Load member and check if it's actually a member
      const member = await this.fetchUser(memberId);
      if ((member.roles ?? 'member') !== 'member') {
        throw new BadRequestException(
          'EOV dashboard is only accessible to members, not sub-members.',
        );
      }

      // 2) Get all sub-members under this member
      const subMembers = await this.fetchSubMembersForMember(memberId);
      const allUserIds = [memberId, ...subMembers.map((s) => String(s.id))];

      // 3) Get all user clubs for member + sub-members
      const allUserClubs = (
        await Promise.all(
          allUserIds.map((uid) =>
            this.jsonServerService.getUserClubs({
              userId: uid,
              clubId: member.currently_at,
            }),
          ),
        )
      ).flat();

      // 4) Calculate totals from userClubs
      const totalAllowance = allUserClubs.reduce(
        (sum, uc) => sum + (Number(uc.totalAllowance) || 0),
        0,
      );

      const totalSpending = allUserClubs.reduce(
        (sum, uc) => sum + (Number(uc.totalSpent) || 0),
        0,
      );

      const remainingAllowance = totalAllowance - totalSpending;
      // 3) Get all transactions for member and sub-members
      const allTransactions = await this.jsonServerService.getTransactions();
      const memberTransactions = allTransactions.filter((tx) =>
        allUserIds.includes(String(tx.userId)),
      );

      // 6) Get flagged transactions
      const flaggedTransactions = memberTransactions.filter(
        (tx) => tx.flagChargeId,
      );

      // 7) Get flag charges count
      const flagCharges = await this.jsonServerService.getFlagCharges();
      const memberFlagCharges = flagCharges.filter((fc) =>
        allUserIds.includes(String(fc.userId)),
      );

      return {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          flaggedChargeCount: memberFlagCharges.length,
          totalSpending,
          totalAllowance,
          flaggedTransactions: flaggedTransactions,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Generate summary report for a specific time period
   */
  async getSummaryReport(memberId: string, period?: string) {
    try {
      if (!memberId)
        throw new BadRequestException('Missing authenticated user id');

      // 1) Load member and check if it's actually a member
      const member = await this.fetchUser(memberId);
      if ((member.roles ?? 'member') !== 'member') {
        throw new BadRequestException(
          'EOV summary is only accessible to members, not sub-members.',
        );
      }

      // 2) Get all sub-members under this member
      const subMembers = await this.fetchSubMembersForMember(memberId);
      const allUserIds = [memberId, ...subMembers.map((s) => String(s.id))];

      // 3) Get all transactions for member and sub-members
      const allTransactions = await this.jsonServerService.getTransactions();
      let memberTransactions = allTransactions.filter((tx) =>
        allUserIds.includes(String(tx.userId)),
      );

      // 4) Apply time period filtering
      const { filteredTransactions, periodInfo } =
        this.filterTransactionsByPeriod(memberTransactions, period);

      // 5) Calculate summary statistics
      const totalSpending = filteredTransactions.reduce(
        (sum, tx) => sum + (Number(tx.bill) || 0),
        0,
      );

      const totalAllowance = await this.calculateTotalAllowance(
        member,
        subMembers,
      );

      const flaggedTransactions = filteredTransactions.filter(
        (tx) => tx.flagChargeId !== null && tx.flagChargeId !== undefined,
      );

      const flagCharges = await this.jsonServerService.getFlagCharges();
      const memberFlagCharges = flagCharges.filter((fc) =>
        allUserIds.includes(String(fc.userId)),
      );

      // 6) Category breakdown
      const categoryBreakdown =
        this.calculateCategoryBreakdown(filteredTransactions);

      // 7) Status breakdown
      const statusBreakdown =
        this.calculateStatusBreakdown(filteredTransactions);

      // 8) Time-based breakdown
      const timeBreakdown = this.calculateTimeBreakdown(
        filteredTransactions,
        period,
      );

      // 9) Separate verified and flagged transactions
      const verifiedSpends = filteredTransactions.filter(
        (tx) => tx.status === 'approved' && tx.verifyCharge === true,
      );

      const flaggedCharges = filteredTransactions.filter(
        (tx) => tx.flagChargeId !== null && tx.flagChargeId !== undefined,
      );

      // 10) Get full club and member breakdown
      const clubBreakdown = await this.getClubAndMemberBreakdown(
        member,
        subMembers,
        filteredTransactions,
      );

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
            totalAmount: verifiedSpends.reduce(
              (sum, tx) => sum + (Number(tx.bill) || 0),
              0,
            ),
            transactions: verifiedSpends,
          },
          flaggedCharges: {
            count: flaggedCharges.length,
            totalAmount: flaggedCharges.reduce(
              (sum, tx) => sum + (Number(tx.bill) || 0),
              0,
            ),
            transactions: flaggedCharges,
          },
          clubAndMemberBreakdown: clubBreakdown,
          subMembers: subMembers.map((sm) => ({
            id: sm.id,
            fullname: sm.fullname,
            email: sm.email,
          })),
          // Commented out transaction details - uncomment if needed
          // transactionDetails: filteredTransactions
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Send email report
   */
  async sendEmailReport(memberId: string, period?: string, autoSend?: boolean) {
    try {
      if (!memberId)
        throw new BadRequestException('Missing authenticated user id');

      // 1) Get member details
      const member = await this.fetchUser(memberId);
      if ((member.roles ?? 'member') !== 'member') {
        throw new BadRequestException(
          'Email reports are only accessible to members, not sub-members.',
        );
      }

      // 2) Check if member has email on file
      if (!member.email) {
        throw new BadRequestException(
          'Member has no email address on file. Please update your profile with an email address.',
        );
      }

      // 3) Generate summary report
      const summaryReport = await this.getSummaryReport(memberId, period);

      // 4) Generate email content
      const emailContent = this.generateEmailContent(
        summaryReport.data,
        member,
      );

      // 5) Handle auto-send logic
      if (autoSend === true) {
        // Auto-send: Send email immediately
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
      } else {
        // Manual send: Return email content for preview/manual sending
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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Enhanced PDF generation with time period filtering
   */
  async fetchAndGenerateReport(
    memberId: string,
    period?: string,
  ): Promise<{ success: boolean; link?: string; message?: string }> {
    if (!memberId)
      throw new BadRequestException('Missing authenticated user id');

    // 1) Load member (pivot submember → parent)
    let member = await this.fetchUser(memberId);
    if ((member.roles ?? 'member') !== 'member') {
      const parentId = member.parentId;
      if (!parentId) {
        throw new BadRequestException(
          'Sub-member has no parent member (parentId).',
        );
      }
      member = await this.fetchUser(String(parentId));
      memberId = String(member.id);
    }

    const clubId = member.currently_at;
    if (!clubId) {
      throw new BadRequestException(
        'User has no active club (currently_at is empty).',
      );
    }

    // 2) Fetch related data
    const [club, submembers, clubTransactions, flagCharges] = await Promise.all(
      [
        this.fetchClub(String(clubId)),
        this.fetchSubMembersForMember(memberId),
        this.fetchTransactionsForClub(String(clubId), memberId),
        this.fetchFlagChargesForMember(memberId),
      ],
    );

    // 3) Fetch user_clubs for member + sub-members (for this club only)
    const allUserClubs = await this.jsonServerService.getUserClubs({
      memberId,
      clubId: String(clubId),
    });

    // pick only member + its submembers in this club
    const allowedIds = new Set([
      String(memberId),
      ...submembers.map((u) => String(u.id)),
    ]);
    // const scopedUserClubs = allUserClubs.filter((uc) =>
    //   allowedIds.has(String(uc.userId)),
    // );

    // 4) Scope transactions to member + submembers
    const spenderIds = new Set<string>(allowedIds);
    const usersById = new Map<string, User>([
      [String(member.id), member],
      ...submembers.map((u) => [String(u.id), u] as [string, User]),
    ]);
    let transactions = clubTransactions.filter((t) =>
      spenderIds.has(String(t.userId)),
    );

    // 5) Apply time period filtering
    const { filteredTransactions, periodInfo } =
      this.filterTransactionsByPeriod(transactions, period);
    transactions = filteredTransactions;

    // 6) Generate PDF (⚡ updated to take user_clubs instead of finance)
    return this.generatePDFReport(
      member,
      club,
      submembers,
      allUserClubs, // 👈 pass user_clubs here
      transactions,
      flagCharges,
      usersById,
      periodInfo,
    );
  }

  // ---------------- helpers ----------------

  /**
   * Filter transactions by time period
   */
  private filterTransactionsByPeriod(
    transactions: Transaction[],
    period?: string,
  ) {
    const now = new Date();
    let startDate: Date;
    let periodInfo: { name: string; startDate: string; endDate: string };

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
        // All time - no filtering
        periodInfo = {
          name: 'All Time',
          startDate: 'N/A',
          endDate: now.toISOString().split('T')[0],
        };
        return { filteredTransactions: transactions, periodInfo };
    }

    const filteredTransactions = transactions.filter((tx) => {
      const dateString = tx.createdAt || tx.date || tx.updatedAt;
      if (!dateString) return false;
      const txDate = new Date(dateString);
      return txDate >= startDate && txDate <= now;
    });

    return { filteredTransactions, periodInfo };
  }

  /**
   * Calculate total allowance for member and sub-members
   */
  private async calculateTotalAllowance(
    member: User,
    subMembers: User[],
  ): Promise<number> {
    try {
      // Get all user_clubs for this member + sub-members in the given club
      const allUserIds = [member.id, ...subMembers.map((sm) => sm.id)];

      const userClubs = await this.jsonServerService.getUserClubs({
        memberId: member.id,
        clubId: String(member.currently_at),
      });

      // Only take user_clubs belonging to this member + its sub-members
      const relevantUserClubs = userClubs.filter((uc) =>
        allUserIds.includes(uc.userId),
      );

      // Sum totalAllowance from these records
      const totalAllowance = userClubs.reduce(
        (sum, uc) => sum + (uc.totalAllowance || 0),
        0,
      );

      return totalAllowance;
    } catch {
      return 0;
    }
  }

  /**
   * Calculate category breakdown
   */
  private calculateCategoryBreakdown(transactions: Transaction[]) {
    return transactions.reduce(
      (acc, tx) => {
        const category = tx.category || 'Uncategorized';
        const amount = Number(tx.bill) || 0;
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Calculate status breakdown
   */
  private calculateStatusBreakdown(transactions: Transaction[]) {
    return transactions.reduce(
      (acc, tx) => {
        const status = tx.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Get full club and member breakdown
   */
  private async getClubAndMemberBreakdown(
    member: User,
    subMembers: User[],
    transactions: Transaction[],
  ) {
    try {
      // 1) Get current club info
      const club = await this.fetchClub(String(member.currently_at));

      // 2) Get the user_club record for the member in this club
      const [memberClub] = await this.jsonServerService.getUserClubs({
        userId: String(member.id),
        clubId: String(member.currently_at),
      });

      // 3) Get user_club records for each sub-member in this club
      const subMemberClubs = await Promise.all(
        subMembers.map(async (sm) => {
          const [uc] = await this.jsonServerService.getUserClubs({
            userId: String(sm.id),
            clubId: String(member.currently_at),
          });
          return { subMember: sm, userClub: uc };
        }),
      );

      // 4) Member transactions (scoped to this club)
      const memberTransactions = transactions.filter(
        (tx) =>
          String(tx.userId) === String(member.id) &&
          String(tx.clubId) === String(member.currently_at),
      );
      const memberSpending = memberTransactions.reduce(
        (sum, tx) => sum + (Number(tx.bill) || 0),
        0,
      );

      // 5) Sub-member breakdown
      const subMemberBreakdown = subMemberClubs.map(
        ({ subMember, userClub }) => {
          const subMemberTransactions = transactions.filter(
            (tx) =>
              String(tx.userId) === String(subMember.id) &&
              String(tx.clubId) === String(member.currently_at),
          );
          const subMemberSpending = subMemberTransactions.reduce(
            (sum, tx) => sum + (Number(tx.bill) || 0),
            0,
          );

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
              remainingAllowance:
                (userClub?.totalAllowance || 0) - (userClub?.totalSpent || 0),
            },
            transactions: {
              count: subMemberTransactions.length,
              totalSpent: subMemberSpending,
              verified: subMemberTransactions.filter(
                (tx) => tx.status === 'approved' && tx.verifyCharge === true,
              ).length,
              flagged: subMemberTransactions.filter(
                (tx) =>
                  tx.flagChargeId !== null && tx.flagChargeId !== undefined,
              ).length,
            },
          };
        },
      );

      // 6) Totals (member + subs for this club)
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
            remainingAllowance:
              (memberClub?.totalAllowance || 0) - (memberClub?.totalSpent || 0),
          },
          transactions: {
            count: memberTransactions.length,
            totalSpent: memberSpending,
            verified: memberTransactions.filter(
              (tx) => tx.status === 'approved' && tx.verifyCharge === true,
            ).length,
            flagged: memberTransactions.filter(
              (tx) => tx.flagChargeId !== null && tx.flagChargeId !== undefined,
            ).length,
          },
        },
        subMembers: subMemberBreakdown,
        totals: {
          totalAllowance:
            (memberClub?.totalAllowance || 0) +
            subMemberBreakdown.reduce(
              (sum, sm) => sum + (sm.clubFinance?.totalAllowance || 0),
              0,
            ),
          totalSpent:
            (memberClub?.totalSpent || 0) +
            subMemberBreakdown.reduce(
              (sum, sm) => sum + (sm.clubFinance?.totalSpent || 0),
              0,
            ),
          totalTransactions: transactions.filter(
            (tx) => String(tx.clubId) === String(member.currently_at),
          ).length,
          totalVerified: transactions.filter(
            (tx) =>
              String(tx.clubId) === String(member.currently_at) &&
              tx.status === 'approved' &&
              tx.verifyCharge === true,
          ).length,
          totalFlagged: transactions.filter(
            (tx) =>
              String(tx.clubId) === String(member.currently_at) &&
              tx.flagChargeId !== null &&
              tx.flagChargeId !== undefined,
          ).length,
        },
      };
    } catch (error) {
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

  /**
   * Calculate time-based breakdown (day-to-day, week-to-week, month-to-month)
   */
  private calculateTimeBreakdown(transactions: Transaction[], period?: string) {
    const breakdown: Record<
      string,
      {
        date: string;
        transactions: number;
        totalSpent: number;
        categories: Record<string, number>;
        status: Record<string, number>;
        flaggedCount: number;
      }
    > = {};

    transactions.forEach((tx) => {
      const dateString = tx.createdAt || tx.date || tx.updatedAt;
      if (!dateString) return;

      const txDate = new Date(dateString);
      let key: string;

      switch (period?.toLowerCase()) {
        case 'daily':
          // Day-to-day breakdown
          key = txDate.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'weekly':
          // Week-to-week breakdown (start of week)
          const startOfWeek = new Date(txDate);
          startOfWeek.setDate(txDate.getDate() - txDate.getDay());
          key = startOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'monthly':
          // Month-to-month breakdown
          key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
          break;
        default:
          // All time - group by month
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

      // Category breakdown for this time period
      const category = tx.category || 'Uncategorized';
      entry.categories[category] =
        (entry.categories[category] || 0) + (Number(tx.bill) || 0);

      // Status breakdown for this time period
      const status = tx.status || 'unknown';
      entry.status[status] = (entry.status[status] || 0) + 1;

      // Flagged count for this time period
      if (tx.flagChargeId !== null && tx.flagChargeId !== undefined) {
        entry.flaggedCount += 1;
      }
    });

    // Convert to array and sort by date
    return Object.values(breakdown).sort((a, b) => {
      if (period?.toLowerCase() === 'monthly') {
        return a.date.localeCompare(b.date);
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  /**
   * Generate email content
   */
  private generateEmailContent(reportData: any, member: User): string {
    const { period, summary, breakdown } = reportData;

    // Generate time-based breakdown section
    const timeBreakdownSection =
      breakdown.timeBased && breakdown.timeBased.length > 0
        ? `
      <h3>${period.name} Breakdown</h3>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Date</th>
          <th>Transactions</th>
          <th>Total Spent</th>
        </tr>
        ${breakdown.timeBased
          .map(
            (entry: any) => `
          <tr>
            <td>${entry.date}</td>
            <td>${entry.transactions}</td>
            <td>$${entry.totalSpent}</td>
          </tr>
        `,
          )
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

  /**
   * Send email (mock implementation)
   */
  private async sendEmail(
    recipient: string,
    content: string,
  ): Promise<{ id: string }> {
    // Mock email sending - replace with actual email service like SendGrid, AWS SES, etc.
    console.log(`Sending email to: ${recipient}`);
    console.log(`Content: ${content}`);

    // Simulate email sending
    return {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Generate PDF report with period information
   */
  private async generatePDFReport(
    member: User,
    club: Club | null,
    submembers: User[],
    userClubs: UserClub[], // 👈 pass user_clubs for this member
    transactions: Transaction[],
    flagCharges: FlagCharge[],
    usersById: Map<string, User>,
    periodInfo: { name: string; startDate: string; endDate: string },
  ): Promise<{ success: boolean; link?: string; message?: string }> {
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

      const safeMoveDown = (n = 0.5) => {
        try {
          doc.moveDown(n);
        } catch {
          /* ignore */
        }
      };

      const formatCurrency = (val: number) =>
        `$${(val || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      // ========== Title ==========
      doc.fontSize(20).text('Transactions Report', { align: 'center' });
      safeMoveDown(0.3);
      doc
        .fontSize(12)
        .fillColor('blue')
        .text(
          `Period: ${periodInfo.name} (${periodInfo.startDate} to ${periodInfo.endDate})`,
          { align: 'center' },
        )
        .fillColor('black');
      safeMoveDown(0.3);
      doc
        .fontSize(10)
        .fillColor('gray')
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
        .fillColor('black');
      safeMoveDown(1);

      const section = (title: string) => {
        doc.font('Helvetica-Bold').fontSize(14).text(title);
        doc.font('Helvetica').fontSize(11);
        safeMoveDown(0.4);
      };

      // ========== Member & Club ==========
      section('Member & Club');
      doc.text(`Member: ${member.fullname ?? member.id}`);
      doc.text(`Email:  ${member.email ?? '—'}`);
      doc.text(`Club:   ${club?.name ?? 'Unknown'} (${club?.location ?? '—'})`);
      safeMoveDown(0.8);

      // ========== Club Finance ==========
      section('Club Finance Summary');
      const userClub = userClubs.find(
        (uc) =>
          String(uc.userId) === String(member.id) &&
          String(uc.clubId) === String(club?.id),
      );
      if (userClubs) {
        const totalAllowance = userClubs.reduce(
          (sum, uc) => sum + (uc.totalAllowance || 0),
          0,
        );
        const totalSpent = userClubs.reduce(
          (sum, uc) => sum + (uc.totalSpent || 0),
          0,
        );
        const remaining = totalAllowance - totalSpent;
        doc.text(`Total Allowance: ${formatCurrency(totalAllowance)}`);
        doc.text(`Total Spent:     ${formatCurrency(totalSpent)}`);
        doc.text(`Remaining:       ${formatCurrency(remaining || 0)}`);
      } else {
        doc
          .fontSize(10)
          .text('No user_club record found for this member in this club.');
      }
      safeMoveDown(0.8);

      // ========== Sub-members ==========
      section('Sub-members');
      if (!submembers.length) {
        doc.fontSize(10).text('No sub-members.');
      } else {
        submembers.forEach((s, i) => {
          doc.text(`${i + 1}. ${s.fullname ?? s.id}  •  ${s.email ?? '—'}`);
        });
      }
      safeMoveDown(1);

      // ========== Period Summary ==========
      section('Period Summary');
      doc.text(`Period: ${periodInfo.name}`);
      doc.text(`Date Range: ${periodInfo.startDate} to ${periodInfo.endDate}`);
      doc.text(`Transactions in Period: ${transactions.length}`);
      const totalBill = transactions.reduce(
        (s, t) => s + (Number(t?.bill) || 0),
        0,
      );
      doc.text(`Total Spending: ${formatCurrency(totalBill)}`);
      safeMoveDown(0.8);

      // ========== Status Breakdown ==========
      const approved = transactions.filter(
        (t) => t?.status === 'approved',
      ).length;
      const refused = transactions.filter(
        (t) => t?.status === 'refused',
      ).length;
      const pending = transactions.filter(
        (t) => t?.status === 'pending',
      ).length;

      section('Status Breakdown');
      doc.text(`Approved: ${approved}`);
      doc.text(`Refused:  ${refused}`);
      doc.text(`Pending:  ${pending}`);
      safeMoveDown(0.8);

      // ========== Category Breakdown ==========
      const categoryTotals = transactions.reduce<Record<string, number>>(
        (acc, t) => {
          const amt = Number(t.bill) || 0;
          acc[t.category] = (acc[t.category] ?? 0) + amt;
          return acc;
        },
        {},
      );

      section('Category Breakdown');
      const cats = Object.entries(categoryTotals);
      if (!cats.length) {
        doc.fontSize(10).text('No categories to show.');
      } else {
        cats.forEach(([cat, amount]) =>
          doc.text(`- ${cat}: ${formatCurrency(amount)}`),
        );
      }
      safeMoveDown(1);

      // ========== Time Breakdown ==========
      const timeBreakdown = this.calculateTimeBreakdown(
        transactions,
        periodInfo.name.toLowerCase(),
      );
      if (timeBreakdown.length > 0) {
        section(`${periodInfo.name} Breakdown`);
        doc.fontSize(10);
        timeBreakdown.forEach((entry, idx) => {
          doc.text(
            `${idx + 1}. ${entry.date}: ${entry.transactions} transactions, ${formatCurrency(
              entry.totalSpent,
            )} spent`,
          );
          safeMoveDown(0.2);
        });
        safeMoveDown(0.8);
      }

      // ========== Transactions (Detailed) ==========
      section('Transactions (Detailed)');
      if (!transactions.length) {
        doc.fontSize(10).text('No transactions found for this period.');
      } else {
        doc.fontSize(10);
        const pageBottom = () =>
          (Number((doc as any).page?.height) || 842) - 80;

        transactions.forEach((t, idx) => {
          const spender = usersById.get(String(t.userId));
          const spenderLine = spender
            ? `${spender.fullname ?? spender.id} / ${spender.email ?? '—'} / ${
                spender.roles ?? '—'
              }`
            : `Unknown (${t.userId})`;

          const line =
            `${idx + 1}. ` +
            `Txn: ${t.id} | Club: ${club?.name} | Category: ${t.category} | ` +
            `Bill: ${formatCurrency(Number(t.bill) || 0)} | Status: ${t.status} | Verified: ${
              t.verifyCharge ? 'Yes' : 'No'
            } | ` +
            `Flag: ${t.flagChargeId ?? ''}\n` +
            `    Spender: ${spenderLine}`;

          doc.text(line);
          safeMoveDown(0.2);

          try {
            if (Number((doc as any).y) > pageBottom()) doc.addPage();
          } catch {
            /* ignore */
          }
        });
      }

      safeMoveDown(1.2);

      // ========== Flagged Charges ==========
      section('Flagged Charges');
      if (!flagCharges.length) {
        doc.fontSize(10).text('No flagged charges.');
      } else {
        flagCharges.forEach((f, idx) => {
          doc
            .fontSize(11)
            .text(`#${idx + 1} (ID: ${f.id})  Owner: ${member.fullname}`);
          doc.fontSize(10).text(`Comment: ${f.comment}`);
          if (Array.isArray(f.reasons) && f.reasons.length) {
            doc.text(`Reasons: ${f.reasons.join(', ')}`);
          }
          safeMoveDown(0.3);
          try {
            const bottom = (Number((doc as any).page?.height) || 842) - 80;
            if (Number((doc as any).y) > bottom) doc.addPage();
          } catch {
            /* ignore */
          }
        });
      }

      // ========== Footer ==========
      safeMoveDown(2);
      doc
        .fontSize(9)
        .fillColor('gray')
        .text('End of report', { align: 'center' })
        .fillColor('black');

      doc.end();

      await new Promise<void>((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', reject);
      });

      return {
        success: true,
        link: `/uploads/${fileName}`,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async fetchUser(userId: string): Promise<User> {
    try {
      const user: User = await this.jsonServerService.getUser(userId);
      if (!user || !user.id) throw new NotFoundException('User not found');
      return user;
    } catch {
      throw new InternalServerErrorException('Failed to load user');
    }
  }

  private async fetchSubMembersForMember(memberId: string): Promise<User[]> {
    try {
      const users = await this.jsonServerService.getUsers({
        parentId: memberId,
        roles: 'submember',
      });
      return users;
    } catch {
      try {
        const allUsers = await this.jsonServerService.getUsers();
        return allUsers.filter(
          (u) =>
            String(u.parentId) === String(memberId) &&
            (u.roles as string) === 'submember',
        );
      } catch {
        throw new InternalServerErrorException('Failed to load sub-members');
      }
    }
  }

  private async fetchClub(clubId: string): Promise<Club | null> {
    try {
      const club = await this.jsonServerService.getClub(clubId);
      return club ?? null;
    } catch {
      return null; // not fatal
    }
  }

  private async fetchFinance(
    userId: string,
    clubId: string,
  ): Promise<{ totalAllowance: number; totalSpent: number } | null> {
    if (!userId || !clubId) return null;
    try {
      const [userClub] = await this.jsonServerService.getUserClubs({
        userId,
        clubId,
      });

      if (!userClub) return null;

      return {
        totalAllowance: userClub.totalAllowance ?? 0,
        totalSpent: userClub.totalSpent ?? 0,
      };
    } catch {
      return null; // not fatal
    }
  }

  private async fetchTransactionsForClub(
    clubId: string,
    memberId: string,
  ): Promise<Transaction[]> {
    try {
      const transactions = await this.jsonServerService.getTransactions({
        clubId,
        memberId,
      });
      return transactions;
    } catch {
      throw new InternalServerErrorException('Failed to load transactions');
    }
  }

  private async fetchFlagChargesForMember(
    memberId: string,
  ): Promise<FlagCharge[]> {
    try {
      const flagCharges = await this.jsonServerService.getFlagCharges({
        userId: memberId,
      });
      return flagCharges;
    } catch {
      try {
        const allFlagCharges = await this.jsonServerService.getFlagCharges();
        return allFlagCharges.filter(
          (f) => String(f.userId) === String(memberId),
        );
      } catch {
        throw new InternalServerErrorException('Failed to load flag charges');
      }
    }
  }
}
