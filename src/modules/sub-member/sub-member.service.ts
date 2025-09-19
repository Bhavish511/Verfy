import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSubMemberDto } from './dto/create-sub-member.dto';
import { generateInvitationCode } from '../../utils/createGenerationCode';
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
    // currently_at: null,
    roles: 'submember',
  };

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
  async createSubMember(createSubMemberDto: CreateSubMemberDto, req) {
    try {
      const parent = req.user;

      // 1. Check if user already exists
      const users = await this.jsonServerService.getUsers({
        email: createSubMemberDto.email,
      });
      if (users && users.length > 0) {
        throw new BadRequestException('User Already Exist!');
      }

      // 2. Create sub-member
      const subMember = await this.jsonServerService.createUser({
        ...createSubMemberDto,
        ...this.fields,
        parentId: parent.id,
        currently_at: parent.currently_at,
        roles: 'submember',
      });

      // 3. Get clubs parent belongs to
      const memberClubs = await this.jsonServerService.getClubsFormember(
        parent.id,
      );
      if (!memberClubs || memberClubs.length === 0) {
        throw new BadRequestException('Parent does not belong to any clubs');
      }
      const clubIds = [...new Set(memberClubs.map((club) => club.clubId))];

      // 4. Create user_clubs for sub-member (initial totalSpent = 0)
      const userClubPromises = clubIds.map((clubId) =>
        this.jsonServerService.createUserClub({
          userId: subMember.id,
          clubId,
          billingCycle: createSubMemberDto.BillingCycle,
          memberId: parent.id,
          totalAllowance: createSubMemberDto.allowance,
          totalSpent: 0,
        }),
      );
      await Promise.all(userClubPromises);

      // 5. Generate invitation code
      const invitationCode = generateInvitationCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitationCodeData =
        await this.jsonServerService.createInvitationCode({
          invitationCode,
          subMemberId: subMember.id,
          memberId: parent.id,
          status: 'active',
          expiresAt: expiresAt.toISOString(),
        });

      // 6. Auto-create 2 default transactions per club
      const allowance = createSubMemberDto.allowance;
      if (allowance <= 0) {
        throw new BadRequestException('Allowance must be greater than zero');
      }

      const categories = await this.transactionService.getCategories(req);
      if (!categories || categories.data.length < 2) {
        throw new BadRequestException('Not enough categories available');
      }

      const shuffled = [...categories.data].sort(() => 0.5 - Math.random());
      const uniqueCategories = Array.from(new Set(shuffled)).slice(0, 2);

      for (const clubId of clubIds) {
        const transaction1Bill = Math.floor(allowance * 0.3);
        const transaction2Bill = Math.floor(allowance * 0.2);

        // Create 2 default transactions
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

        // Update user_clubs totalSpent for this club
        const [userClub] = await this.jsonServerService.getUserClubs({
          userId: subMember.id,
          clubId,
        });

        if (userClub) {
          await this.jsonServerService.updateUserClub(userClub.id, {
            totalSpent:
              (userClub.totalSpent || 0) + transaction1Bill + transaction2Bill,
          });
        }
      }

      // 7. Fetch totalSpent from user_clubs (sum across all clubs)
      const [userClubs] = await this.jsonServerService.getUserClubs({
        userId: subMember.id,
        clubId: subMember.currently_at,
      });

      // 8. Clean response (remove password)
      const { password, ...subMemberWithoutPassword } = subMember;

      subMemberWithoutPassword.totalSpent = userClubs.totalSpent;

      // 9. Return response
      return {
        success: true,
        message:
          'Sub Member created successfully with default transactions and added to all member clubs!',
        data: {
          subMember: subMemberWithoutPassword,
          invitationCode: invitationCodeData.invitationCode,
          expiresAt: invitationCodeData.expiresAt,
          clubsAdded: memberClubs.length,
        },
      };
    } catch (error) {
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
      throw new BadRequestException('You are not eligible to get Sub members!');
    }
    console.log(user);

    const memberId = String(user.id);
    const clubId = String(user.currently_at);

    // 1) Get all user_clubs under this member in this club
    const userClubs = await this.jsonServerService.getUserClubs({
      memberId: memberId,
      clubId,
    });

    console.log(userClubs);

    // 2) Get user objects for these submembers
    const subMemberIds = userClubs.map((uc: any) => String(uc.userId));

    const allUsers = await this.jsonServerService.getUsers();
    const submembers = allUsers.filter(
      (u: any) =>
        subMemberIds.includes(String(u.id)) && u.roles === 'submember',
    );

    // 3) Merge user info + their totals from user_clubs
    const enriched = submembers.map((user: any) => {
      const uc = userClubs.find(
        (x: any) => String(x.userId) === String(user.id),
      );
      return {
        ...user,
        totalSpent: Number(uc?.totalSpent ?? 0),
        allowance: Number(uc?.totalAllowance ?? 0),
      };
    });

    return {
      success: true,
      data: {
        users: enriched,
      },
    };
  }

  async removeSubMember(id: string) {
    try {
      // 1. Get subMember
      const subMember = await this.jsonServerService.getUser(id);
      if (!subMember) {
        throw new NotFoundException('Sub Member not found');
      }

      // 2. Delete from user_clubs
      const userClubs = await this.jsonServerService.getUserClubs({
        userId: id,
      });
      for (const uc of userClubs) {
        await this.jsonServerService.deleteUserClub(uc.id);
      }

      // 3. Delete transactions (and related flagCharges first)
      const transactions = await this.jsonServerService.getTransactions({
        userId: id,
      });
      if (transactions?.length > 0) {
        for (const tx of transactions) {
          // Delete flagCharges linked to this transaction
          const flagCharges = await this.jsonServerService.getFlagCharges({
            transactionId: tx.id,
          });

          if (flagCharges?.length > 0) {
            for (const fc of flagCharges) {
              await this.jsonServerService.deleteFlagCharge(fc.id);
            }
          }

          // Now delete the transaction itself
          await this.jsonServerService.deleteTransaction(tx.id);
        }
      }

      // 4. Delete daily expenses
      const expenses = await this.jsonServerService.getDailyExpenses({
        userId: id,
      });
      for (const exp of expenses) {
        await this.jsonServerService.deleteDailyExpense(exp.id);
      }

      // 6. Delete invitation codes
      const invitationCodes = await this.jsonServerService.getInvitationCodes({
        subMemberId: id,
      });
      for (const code of invitationCodes) {
        await this.jsonServerService.deleteInvitationCode(code.id);
      }

      // 7. Finally, delete the subMember itself
      await this.jsonServerService.deleteUser(id);

      return { success: true, message: 'Sub Member Removed!', subMember };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async editAllowance(req, userId: string, allowance: number) {
    try {
      const user = req.user;
      console.log(user);
      const parentData = await this.jsonServerService.getUser(user.id);
      console.log(parentData);

      // 1. Fetch sub-member
      const subMember = await this.jsonServerService.getUser(userId);
      if (!subMember) {
        return {
          success: false,
          message: 'Sub-member not found',
          data: null,
        };
      }

      // 2. Validate allowance
      if (allowance < 0) {
        return {
          success: false,
          message: 'Allowance cannot be less than zero',
          data: null,
        };
      }

      // 3. Get sub-member’s club record
      const [userClub] = await this.jsonServerService.getUserClubs({
        userId: String(userId),
        clubId: String(parentData.currently_at),
      });

      if (!userClub) {
        return {
          success: false,
          message: 'User is not part of this club',
          data: null,
        };
      }

      // 4. Check allowance against already spent
      if (allowance <= (userClub.totalSpent || 0)) {
        return {
          success: false,
          message: `New allowance (${allowance}) must be greater than total spent (${userClub.totalSpent}).`,
          data: null,
        };
      }

      // 5. Update user_club record
      const updatedUserClub = await this.jsonServerService.updateUserClub(
        userClub.id,
        { totalAllowance: allowance },
      );
      console.log(updatedUserClub);

      const data = await this.jsonServerService.getUserClub(userClub.id);
      console.log(data);

      return {
        success: true,
        message: 'New Allowance Set!',
        data: { userClub: updatedUserClub },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message ?? 'Edit allowance failed',
        data: null,
      };
    }
  }

  async getsubDashboard(id: string) {
    try {
      // 1. Get sub-member
      const user = await this.jsonServerService.getUser(id);
      if (!user) throw new Error('Unauthorized');

      const userId = String(user.id);
      const memberId = user.parentId != null ? String(user.parentId) : null;
      const currentClubId = String(user.currently_at);

      // 2. Fetch all needed data
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

      // 3. Get the user_club record (single, since sub-member belongs to currentClubId)
      const [userClub] = userClubs || [];
      console.log(userClub);

      const totalSpent = Number(userClub?.totalSpent ?? 0);
      const totalAllowance = Number(userClub?.totalAllowance ?? 0);
      const remainingAllowance = totalAllowance - totalSpent;

      // 4. Recent transactions (last 2)
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
          clubs: [clubDetails].filter(Boolean), // only current club
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
      const user = req.user;
      if (!user) throw new Error('Unauthorized');

      // 1) Fetch full user object
      const userObj = await this.jsonServerService.getUser(user.id);
      const userId = String(userObj.id);
      const currentClubId = String(userObj.currently_at);

      // 2) Fetch this user's user_club records
      const userClubRecords = await this.jsonServerService.getUserClubs({
        userId,
      });
      console.log(userClubRecords);

      // Pick the current club record
      const currentUserClub = userClubRecords.find(
        (uc: any) => String(uc.clubId) === currentClubId,
      );

      if (!currentUserClub) throw new Error('User is not part of this club');

      const memberId = String(currentUserClub.memberId);

      const clubs = (
        await Promise.all(
          userClubRecords.map((uc) =>
            this.jsonServerService.getClubs({ id: uc.clubId }),
          ),
        )
      ).flat();
      // 4) Fetch everything in parallel
      const [transactions, clubDetails] = await Promise.all([
        this.jsonServerService.getTransactions({
          userId,
          clubId: currentClubId,
        }),
        this.jsonServerService.getClub(currentClubId).catch(() => null),
      ]);

      // 5) Calculate summary
      const totalSpent = Number(currentUserClub?.totalSpent ?? 0);
      const totalAllowance = Number(currentUserClub?.totalAllowance ?? 0);
      const remainingAllowance = totalAllowance - totalSpent;

      // 6) Get 2 most recent transactions
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
        amount: Number(tx.bill ?? 0) || 0,
        category: tx.category ?? null,
        userName: userObj.fullname || 'Unknown',
      }));

      const transactionsWithDetails = recent.map((tx: any) => ({
        ...tx,
        userName: userObj.fullname || 'Unknown',
      }));

      return {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          summary: { totalSpent, totalAllowance, remainingAllowance },
          clubs: clubs.map((club: any) => ({
            id: club.id,
            name: club.name,
            location: club.location,
            isActive: String(club.id) === currentClubId,
          })),
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
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to retrieve dashboard data',
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

    // Fetch transactions + user_club for this sub-member in the current club
    const [transactions, userClubs] = await Promise.all([
      this.jsonServerService.getTransactions({ userId, clubId: currentClubId }),
      this.jsonServerService.getUserClubs({ userId, clubId: currentClubId }),
    ]);

    // Transactions within the selected period
    const periodTx = (transactions ?? []).filter((tx: any) =>
      this.isInPeriod(tx.createdAt, startDate, endDate),
    );

    // Calculate totals
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
