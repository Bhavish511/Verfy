import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { JsonServerService } from '../../services/json-server.service';

@Injectable()
export class MemberService {
  constructor(
    private readonly transactionService: TransactionsService,
    private readonly jsonServerService: JsonServerService,
  ) {}

  async getDashboard(req: {
    user: { id: string | number; currently_at: string | number };
  }) {
    try {
      const userId = String(req.user.id);
      const currentClubId = String(req.user.currently_at);

      // Pull everything in parallel
      console.log(userId);
      
      const [allUserClubs, { data: transactionsData }, allUsers] =
        await Promise.all([
          this.jsonServerService.getUserClubs({ memberId: userId }),
          this.transactionService.findAllForMember(req), // already filtered to current club
          this.jsonServerService.getUsers(),
        ]);
      
      // Build helpers
      const subMembers = allUsers.filter(
        (u: any) => String(u.parentId) === userId && u.roles === 'submember',
      );

      const allowedUserIds = new Set<string>([
        userId,
        ...subMembers.map((s: any) => String(s.id)),
      ]);

      const userById = new Map<string, any>(
        allUsers.map((u: any) => [String(u.id), u]),
      );

      const nameOf = (uid: string | number) =>
        userById.get(String(uid))?.fullname || 'Unknown';

      // --------------------------
      // Relevant clubs for current club only
      // --------------------------
      const relevantClubs = allUserClubs.filter(
        (uc) =>
          allowedUserIds.has(String(uc.userId)) &&
          String(uc.clubId) === currentClubId,
      );

      // Totals for parent + sub-members in current club
      const totalSpentAll = relevantClubs.reduce(
        (sum, uc) => sum + (Number(uc.totalSpent) || 0),
        0,
      );

      const totalAllowanceAll = relevantClubs.reduce(
        (sum, uc) => sum + (Number(uc.totalAllowance) || 0),
        0,
      );

      const remainingAllowanceAll = totalAllowanceAll - totalSpentAll;

      // --------------------------
      // Sub-member breakdown (current club only)
      // --------------------------
      const subMemberBreakdown = subMembers.map((sm) => {
        const memberClub = relevantClubs.find(
          (uc) => String(uc.userId) === String(sm.id),
        );
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

      // --------------------------
      // Clubs info
      // --------------------------
      const parentClubIds = [
        ...new Set(
          allUserClubs
            .filter((uc) => String(uc.userId) === userId)
            .map((uc) => uc.clubId),
        ),
      ];
      const clubs = (
        await Promise.all(
          parentClubIds.map((id) => this.jsonServerService.getClubs({ id })),
        )
      ).flat();

      // --------------------------
      // Pending transactions for current club
      // --------------------------
      const pendingApprovals = transactionsData?.pendingApprovals ?? 0;

      const allPending: any[] = transactionsData?.pendingCharges ?? [];
      const filteredPending = allPending.filter(
        (c) =>
          allowedUserIds.has(String(c.userId)) &&
          String(c.clubId) === currentClubId,
      );

      const top2Pending = filteredPending
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 2);

      const pendingTransactions = top2Pending.map((charge) => ({
        transactionId: charge.id,
        amount: charge.bill ?? 0,
        category: charge.category ?? null,
        userName: nameOf(charge.userId),
      }));

      // Enriched transactions
      const allTransactions: any[] = transactionsData?.transactions ?? [];
      const wantedIds = new Set(top2Pending.map((c) => String(c.id)));

      const transactions = allTransactions
        .filter((t) => wantedIds.has(String(t.id)))
        .map((t) => ({ ...t, userName: nameOf(t.userId) }));

      // --------------------------
      // Return response
      // --------------------------
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
          clubs: clubs.map((club: any) => ({
            id: club.id,
            name: club.name,
            location: club.location,
            isActive: String(club.id) === currentClubId,
          })),
          pendingTransactions,
          transactions,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to retrieve dashboard data',
        data: null,
        error: error.message,
      };
    }
  }

  async switchClub(clubId: string, req) {
    try {
      const user = req.user;
      const userId = String(user.id);

      // Fetch all clubs this user belongs to
      const memberClubs =
        await this.jsonServerService.getClubsFormember(userId);

      // Find the club object that matches
      const targetClub = memberClubs.find(
        (club: any) => String(club.clubId) === String(clubId),
      );

      if (!targetClub) {
        return {
          success: false,
          message: 'You are not a member of this club',
          data: null,
        };
      }

      // Update user's current club
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
    } catch (error) {
      return {
        success: false,
        message: 'Failed to switch club',
        data: null,
        error: error.message,
      };
    }
  }
  /**
   * Member summary (includes sub-members implicitly via transaction.memberId === member.id)
   * - Fetches by { memberId, clubId }
   * - totalSpent includes ALL statuses (pending/approved/refused)
   */
  async getMemberDashboardSummary(req: any, period: string) {
    const user = req.user;
    if (!user) throw new Error('Unauthorized');

    const memberId = String(user.id);
    const currentClubId = String(user.currently_at);
    let totalSpent: number = 0;
    if (period !== 'all') {
      // Period window
      const { startDate, endDate } = this.getPeriodDateRange(period);

      // Fetch all transactions for this member (own + subs) in this club, and finance
      const [transactions] = await Promise.all([
        this.jsonServerService.getTransactions({
          memberId,
          clubId: currentClubId,
        }),
      ]);

      // Period filter ONLY (we include ALL statuses)
      const periodTx = (transactions ?? []).filter((tx: any) =>
        this.isInPeriod(tx.createdAt, startDate, endDate),
      );

      totalSpent = this.calculateTotalSpent(periodTx);
      // const totalAllowance = Number(finance?.totalAllowance ?? 0);
      // const remainingAllowance = totalAllowance - totalSpent;

      // // If you still want a pending count (not period-filtered), compute it here:
      // const pendingApprovals = (transactions ?? []).filter(
      //   (tx: any) => String(tx.status).toLowerCase() === 'pending'
      // ).length;
    }
    return {
      success: true,
      message: 'Dashboard summary fetched',
      data: {
        totalSpent,
      },
    };
  }
  private getPeriodDateRange(period: string): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    now.setSeconds(0, 0);

    let startDate: Date;
    let endDate: Date;

    switch ((period || 'monthly').toLowerCase()) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'weekly': {
        startDate = new Date(now);
        const day = (startDate.getDay() + 6) % 7; // Monday=0
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - day);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      }
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
          0,
          0,
          0,
          0,
        );
        break;
    }
    return { startDate, endDate };
  }

  private isInPeriod(dateString: string, startDate: Date, endDate: Date) {
    const d = new Date(dateString);
    return d >= startDate && d < endDate;
  }

  private calculateTotalSpent(transactions: any[]): number {
    return (transactions ?? []).reduce(
      (sum, tx) => sum + (Number(tx?.bill) || 0),
      0,
    );
  }

  /**
   * Filter transactions by time period
   */
  private filterTransactionsByPeriod(transactions: any[], period?: string) {
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

  findOne(id: number) {
    return `This action returns a #${id} member`;
  }

  update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
