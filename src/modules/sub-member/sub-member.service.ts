import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateSubMemberDto } from './dto/update-sub-member.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateSubMemberDto } from './dto/create-sub-member.dto';
import { customAlphabet } from 'nanoid';
import { generateInvitationCode } from 'src/utils/createGenerationCode';
import { AxiosError } from 'axios';
import { JsonServerService } from '../../services/json-server.service';
import { TransactionsService } from '../transactions/transactions.service';

import { Logger } from '@nestjs/common';
const log = new Logger('SubMemberService');
type InvitationCodeRow = {
  id: string;
  invitationCode: string;
  subMemberId: string | number;
  memberId: string | number;
};
@Injectable()
export class SubMemberService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jsonServerService: JsonServerService,
    private readonly transactionService: TransactionsService,
  ) {}
  private readonly logger = new Logger(SubMemberService.name);

  fields = {
    // fullname: null,
    // email: null,
    // under12: null,
    // relation: null,
    // allowance: null,
    // totalSpent: null,
    // BillingCycle: null,
    financeId: null,
    currently_at: null,
    roles: 'submember',
  };
  
  async switchClub(clubId: string, req) {
    try {
      const user = req.user;
      const userId = String(user.id);

      // Verify the member belongs to this club
      const clubs = await this.jsonServerService.getUserClubs({ userId });
      const targetClub = clubs.find(
        (club: any) => String(club.clubId) === String(clubId),
      );

      if (!targetClub) {
        return {
          success: false,
          message: 'You are not a submember of this club',
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
            id: targetClub.id,
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
  async createSubMember(createSubMemberDto: CreateSubMemberDto, req) {
    try {
      console.log(req.user.email);
      console.log(createSubMemberDto.email);

      const users = await this.jsonServerService.getUsers({
        email: createSubMemberDto.email,
      });
      if (users && users.length > 0)
        throw new BadRequestException('User Already Exist!');

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

      // Get all clubs that the member belongs to
      const memberClubs = await this.jsonServerService.getClubsForUser(user.id);

      // Create user_clubs entries for the sub-member for each club the member belongs to
      const userClubPromises = memberClubs.map((memberClub) =>
        this.jsonServerService.createUserClub({
          userId: subMember.userId,
          clubId: memberClub.clubId,
          billingCycle: createSubMemberDto.BillingCycle, // Use sub-member's billing cycle
          parentMemberId: user.id, // Parent member ID
          totalAllowance: createSubMemberDto.allowance, // Use sub-member's allowance
        }),
      );

      // Wait for all user_clubs entries to be created
      await Promise.all(userClubPromises);


      const invitationCode = generateInvitationCode();
      // Set expiry date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitationCodeData =
        await this.jsonServerService.createInvitationCode({
          invitationCode,
          subMemberId: subMember.id,
          memberId: user.id,
          status: 'active',
          expiresAt: expiresAt.toISOString(),
        });

      return {
        success: true,
        message:
          'Sub Member created successfully and added to all member clubs!',
        data: {
          subMember,
          invitationCode: invitationCodeData.invitationCode,
          expiresAt: invitationCodeData.expiresAt,
          clubsAdded: memberClubs.length,
        },
      };
    } catch (error) {
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
      throw new BadRequestException('You are not eligible to get Sub members!');
    }

    const memberId = String(user.id);
    const clubId = String(user.currently_at);

    // 1. Get sub-members under this member
    const submembers = await this.jsonServerService.getUsers({
      parentId: memberId,
      roles: 'submember',
    });

    // 2. Get all transactions for this club
    const transactions = await this.jsonServerService.getTransactions({
      clubId,
    });

    // 3. Sum total spent per sub-member
    const spentByUser = new Map<string, number>();
    for (const tx of transactions || []) {
      const uid = String(tx.userId);
      const bill = Number(tx.bill) || 0;
      spentByUser.set(uid, (spentByUser.get(uid) || 0) + bill);
    }

    // 4. Enrich sub-members with totalSpent
    const enriched = submembers.map((s: any) => ({
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

  async removeSubMember(id: string) {
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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async editAllowance(id: string, allowance: number) {
    try {
      const subMember = await this.jsonServerService.getUser(id);
      if (!subMember) {
        throw new BadRequestException('Sub-member not found');
      }

      if (allowance < 0) {
        throw new BadRequestException('Allowance cannot be less than zero');
      }

      const finance = await this.jsonServerService.updateFinance(
        subMember.financeId,
        { totalAllowance: allowance },
      );

      return {
        success: true,
        message: 'New Allowance Set!',
        data: { finance },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getsubDashboard(id: string) {
    try {
      console.log(id);

      const user = await this.jsonServerService.getUser(id); // sub-member
      console.log();

      if (!user) throw new Error('Unauthorized');

      const userId = String(user.id); // sub-member id
      const parentMemberId =
        user.parentId != null ? String(user.parentId) : null; // parent member id (owner)
      const currentClubId = String(user.currently_at);

      // Fetch everything we need in parallel
      const [clubs, transactions, finance, clubDetails] = await Promise.all([
        this.jsonServerService.getClubsForUser(userId),
        this.jsonServerService.getTransactions({
          userId,
          clubId: currentClubId,
        }),
        this.jsonServerService.getFinance(user.financeId),
        this.jsonServerService.getClub(currentClubId).catch(() => null),
      ]);

      // ===== Summary (from finance) =====
      const totalSpent = Number(finance?.totalSpent ?? 0);
      const totalAllowance = Number(finance?.totalAllowance ?? 0);
      const remainingAllowance = totalAllowance - totalSpent;

      // ===== 2 most recent transactions (for this sub-member, current club) =====
      const recent = (transactions || [])
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 2);

      const twoRecentTransactions = recent.map((tx: any) => ({
        transactionId: tx.id,
        amount: Number(tx.bill ?? tx.amount ?? 0) || 0,
        category: tx.category ?? null,
        userName: user.fullname || 'Unknown',
      }));

      // Full objects for those same two (already filtered & sorted)
      const transactionsWithDetails = recent.map((tx: any) => ({
        ...tx,
        clubName: clubDetails?.name || 'Unknown Club',
        canVerify: false, // sub-members cannot verify
        canFlag: true, // sub-members can flag
      }));

      return {
        success: true,
        message: 'Sub-member dashboard data retrieved successfully',
        data: {
          summary: { totalSpent, totalAllowance, remainingAllowance },
          clubs,
          twoRecentTransactions, // [{ transactionId, amount, category, userName }]
          transactions: transactionsWithDetails, // full objects for those same IDs
          finance,
          user: {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            relation: user.relation,
            allowance: Number(finance?.totalAllowance ?? 0),
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to retrieve sub-member dashboard data against member',
        data: null,
        error: error.message,
      };
    }
  }
  async getDashboard(req: { user: any }) {
    try {
      const user = req.user; // sub-member
      if (!user) throw new Error('Unauthorized');

      const userId = String(user.id); // sub-member id
      const parentMemberId =
        user.parentId != null ? String(user.parentId) : null; // parent member id (owner)
      const currentClubId = String(user.currently_at);

      // Fetch everything we need in parallel
      const [clubs, transactions, finance, clubDetails] = await Promise.all([
        // If the UI should show the PARENT member's clubs (as your comment suggests), use parentMemberId.
        // If you actually want the sub-member's clubs, replace parentMemberId ?? userId with userId.
        this.jsonServerService.getClubsForUser(parentMemberId ?? userId),
        this.jsonServerService.getTransactions({
          userId,
          clubId: currentClubId,
        }),
        this.jsonServerService.getFinance(user.financeId),
        this.jsonServerService.getClub(currentClubId).catch(() => null),
      ]);

      // ===== Summary (from finance) =====
      const totalSpent = Number(finance?.totalSpent ?? 0);
      const totalAllowance = Number(finance?.totalAllowance ?? 0);
      const remainingAllowance = totalAllowance - totalSpent;

      // ===== 2 most recent transactions (for this sub-member, current club) =====
      const recent = (transactions || [])
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 2);

      const twoRecentTransactions = recent.map((tx: any) => ({
        transactionId: tx.id,
        amount: Number(tx.bill ?? tx.amount ?? 0) || 0,
        category: tx.category ?? null,
        userName: user.fullname || 'Unknown',
      }));

      // Full objects for those same two (already filtered & sorted)
      const transactionsWithDetails = recent.map((tx: any) => ({
        ...tx,
        clubName: clubDetails?.name || 'Unknown Club',
        canVerify: false, // sub-members cannot verify
        canFlag: true, // sub-members can flag
      }));

      return {
        success: true,
        message: 'Sub-member dashboard data retrieved successfully',
        data: {
          summary: { totalSpent, totalAllowance, remainingAllowance },
          clubs,
          twoRecentTransactions, // [{ transactionId, amount, category, userName }]
          transactions: transactionsWithDetails, // full objects for those same IDs
          finance,
          user: {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            relation: user.relation,
            allowance: Number(finance?.totalAllowance ?? 0),
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to retrieve sub-member dashboard data',
        data: null,
        error: error.message,
      };
    }
  }

  // COMMENTED OUT: Sub-member club change functionality
  // Uncomment this method if you want sub-members to be able to change clubs
  /*
  async switchClub(clubId: string, req) {
    try {
      const user = req.user;
      const userId = String(user.id);
      
      // Get parent member to check club membership
      const parentMember = await this.jsonServerService.getUser(user.userId);
      if (!parentMember) {
        return {
          success: false,
          message: 'Parent member not found',
          data: null
        };
      }
      
      // Verify the parent member belongs to this club
      const clubs = await this.jsonServerService.getClubs({ userId: parentMember.id });
      const targetClub = clubs.find((club: any) => String(club.id) === String(clubId));
      
      if (!targetClub) {
        return {
          success: false,
          message: 'Parent member is not a member of this club',
          data: null
        };
      }
      
      // Update sub-member's current club
      const updatedUser = await this.jsonServerService.updateUser(userId, {
        currently_at: clubId
      });
      
      return {
        success: true,
        message: 'Club switched successfully',
        data: {
          currentClub: {
            id: targetClub.id,
            name: targetClub.name,
            location: targetClub.location
          },
          user: updatedUser
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to switch club',
        data: null,
        error: error.message
      };
    }
  }
  */

  async validateInvitationCode(invitationCode: string) {
    try {
      // 1) Get invitation codes by code
      const invitationCodes = await this.jsonServerService.getInvitationCodes({
        invitationCode,
      });

      const match = invitationCodes[0];
      if (!match) throw new NotFoundException('Invitation code not found.');
      if (!match.subMemberId)
        throw new BadRequestException('Invalid invitation code.');

      // 2) Check if invitation code is active
      if (match.status !== 'active') {
        throw new BadRequestException('Invitation code is no longer active.');
      }

      // 3) Check if invitation code has expired
      const now = new Date();
      const expiresAt = new Date(match.expiresAt);
      if (now > expiresAt) {
        // Mark as expired
        await this.jsonServerService.updateInvitationCode(match.id, {
          status: 'expired',
        });
        throw new BadRequestException('Invitation code has expired.');
      }

      // 4) Get user by subMemberId
      const user = await this.jsonServerService.getUser(match.subMemberId);
      if (!user)
        throw new NotFoundException('Sub member not found for this code.');

      // 5) Mark invitation code as used
      await this.jsonServerService.updateInvitationCode(match.id, {
        status: 'used',
        usedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Invitation code validated successfully!',
        data: user,
      };
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof UnauthorizedException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Failed to validate invitation code.',
      );
    }
  }

  async getSubMemberDashboardSummary(req: any, period: string) {
    const user = req.user;
    if (!user) throw new Error('Unauthorized');

    const userId = String(user.id);
    const currentClubId = String(user.currently_at);

    const { startDate, endDate } = this.getPeriodDateRange(period);

    const [transactions, finance] = await Promise.all([
      this.jsonServerService.getTransactions({ userId, clubId: currentClubId }),
      this.jsonServerService.getFinance(user.financeId),
    ]);

    const periodTx = (transactions ?? []).filter((tx: any) =>
      this.isInPeriod(tx.createdAt, startDate, endDate),
    );

    const totalSpent = this.calculateTotalSpent(periodTx);
    const totalAllowance = Number(finance?.totalAllowance ?? 0);
    const remainingAllowance = totalAllowance - totalSpent;

    return {
      success: true,
      message: 'Dashboard summary fetched',
      data: {
        totalSpent,
        // remainingAllowance,
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

  /** True if dateString ∈ [startDate, endDate) */
  private isInPeriod(
    dateString: string,
    startDate: Date,
    endDate: Date,
  ): boolean {
    const d = new Date(dateString);
    return d >= startDate && d < endDate;
  }

  /** Sum bills (includes ALL statuses; expects { bill } numeric-like). */
  private calculateTotalSpent(transactions: any[]): number {
    return (transactions ?? []).reduce(
      (sum, tx) => sum + (Number(tx?.bill) || 0),
      0,
    );
  }
}

    /**
     * Get dashboard view with total spent amount for specified view period
     */
    // async getDashboardView(req: any, view?: string) {
    //   try {
    //     const user = req.user;
    //     const userId = String(user.id);
    //     const currentClubId = String(user.currently_at);
  
    //     // Get all transactions for this sub-member
    //     const { data: transactionsData } = await this.transactionService.findAllForSubMember(req);
    //     const allTransactions = transactionsData?.transactions || [];
  
    //     // Filter transactions by current club
    //     const filteredTransactions = allTransactions.filter((tx: any) =>
    //       String(tx.clubId) === currentClubId
    //     );
  
    //     // Apply time period filtering
    //     const { filteredTransactions: timeFilteredTransactions, periodInfo } = this.filterTransactionsByPeriod(filteredTransactions, view);
  
    //     // Calculate total spent amount
    //     const totalSpent = timeFilteredTransactions.reduce((sum, tx) =>
    //       sum + (Number(tx.bill) || 0), 0
    //     );
  
    //     return {
    //       success: true,
    //       message: 'Dashboard view retrieved successfully',
    //       data: {
    //         view: periodInfo.name,
    //         period: periodInfo,
    //         totalSpent: totalSpent,
    //         transactionCount: timeFilteredTransactions.length,
    //         userRole: 'submember'
    //       }
    //     };
    //   } catch (error) {
    //     throw new InternalServerErrorException(error.message);
    //   }
    // }
    // /**
    //  * Filter transactions by time period
    //  */
    // private filterTransactionsByPeriod(transactions: any[], period?: string) {
    //   const now = new Date();
    //   let startDate: Date;
    //   let periodInfo: { name: string; startDate: string; endDate: string };
  
    //   switch (period?.toLowerCase()) {
    //     case 'daily':
    //       startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //       periodInfo = {
    //         name: 'Daily',
    //         startDate: startDate.toISOString().split('T')[0],
    //         endDate: now.toISOString().split('T')[0]
    //       };
    //       break;
    //     case 'weekly':
    //       const dayOfWeek = now.getDay();
    //       startDate = new Date(now);
    //       startDate.setDate(now.getDate() - dayOfWeek);
    //       startDate.setHours(0, 0, 0, 0);
    //       periodInfo = {
    //         name: 'Weekly',
    //         startDate: startDate.toISOString().split('T')[0],
    //         endDate: now.toISOString().split('T')[0]
    //       };
    //       break;
    //     case 'monthly':
    //       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    //       periodInfo = {
    //         name: 'Monthly',
    //         startDate: startDate.toISOString().split('T')[0],
    //         endDate: now.toISOString().split('T')[0]
    //       };
    //       break;
    //     default:
    //       // All time - no filtering
    //       periodInfo = {
    //         name: 'All Time',
    //         startDate: 'N/A',
    //         endDate: now.toISOString().split('T')[0]
    //       };
    //       return { filteredTransactions: transactions, periodInfo };
    //   }
  
    //     const filteredTransactions = transactions.filter(tx => {
    //       const dateString = tx.createdAt || tx.date || tx.updatedAt;
    //       if (!dateString) return false;
    //       const txDate = new Date(dateString);
    //       return txDate >= startDate && txDate <= now;
    //     });
  
    //     return { filteredTransactions, periodInfo };
    //   }