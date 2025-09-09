import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JsonServerService } from '../../services/json-server.service';
type Tx = {
  id: string | number;
  clubId: string | number;
  userId: string | number;   // member (parent)
  memberId?: string | number; // sub-member (child)
  bill: number | string;
  category: string;
  status?: 'pending' | 'approved' | 'refused';
  verifyCharge?: boolean;
  description?: string;
  date?: string;       // sometimes present
  createdAt?: string;  // preferred for ordering
  updatedAt?: string;
  [k: string]: any;
};
type Role = 'member' | 'submember' | string;
function toStr(v: string | number) { return String(v); }
type User = { id: string | number; currently_at: string | number; parentId?: string | number | null; roles: Role; };
@Injectable()
export class TransactionsService {
  constructor(
    private readonly jsonServerService: JsonServerService,
  ) {}
  async getCategories(req: any) {
    try {
      const user = req.user;
      console.log(user);
      
      const clubId = String(user.currently_at);

      // Option 1: club-scoped categories
      const transactions = await this.jsonServerService.getTransactions({ clubId });

      // Option 2: global categories across all clubs
      // const transactions = await this.jsonServerService.getTransactions();

      const categories = [
        ...new Set(transactions.map((tx: any) => String(tx.category).trim())),
      ];

      return {
        success: true,
        message: 'Categories fetched successfully',
        data: categories,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch categories',
      );
    }
  }

  async create({ category, bill }: CreateTransactionDto, id: number, req) {
    try {
      const userId = req.user.id;
      const user = await this.jsonServerService.getUser(userId);
      const finance = await this.jsonServerService.getFinance(user.financeId);
      
      if (finance.totalSpent + bill > finance.totalAllowance)
        throw new BadRequestException('Total Amount Exceeded!');
        
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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllForSubMember(req) {
    try {
      const userId = req.user.id;
      const user = req.user;
      // if (user.roles !== 'submember')
      //   throw new BadRequestException('Incorrect token');
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
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
//   async findAllForMember(req: any) {
//   try {
//     const user = req.user as { id: string | number; currently_at: string | number };
//     const userId = String(user.id);
//     const clubId = String(user.currently_at);
//     // fetch in parallel
//     const [allUsers, clubTransactions] = await Promise.all([
//       this.jsonServerService.getUsers(),
//       this.jsonServerService.getTransactions({ clubId }),
//     ]);

//     // Keep only *submembers* that belong to this member
//     const subMembers = allUsers.filter(
//       (u: any) => String(u.parentId) === userId && u.roles === 'submember'
//     );

//     // Build allowed set: member + submember IDs (all as strings)
//     const allowedUserIds = new Set<string>([
//       userId,
//       ...subMembers.map((s: any) => String(s.id)),
//     ]);

//     // Normalize tx.userId to string before comparing
//     const transactions = clubTransactions.filter(
//       (tx: any) => allowedUserIds.has(String(tx.userId))
//     );

//     const pendingCharges = transactions.filter((tx: any) => tx.status === 'pending');

//     return {
//       success: true,
//       data: {
//         transactions,
//         pendingCharges,
//         pendingApprovals: pendingCharges.length,
//       },
//     };
//   } catch (error: any) {
//     throw new InternalServerErrorException(error?.message ?? 'Failed to fetch transactions');
//   }
// }
  
  async  findAllForMember(req) {
  try {
    if (!req?.user) throw new Error('Unauthorized');

    const userId = toStr(req.user.id);
    const clubId = toStr(req.user.currently_at);

    const [subMembers, clubTransactions]: [User[], Tx[]] = await Promise.all([
      this.jsonServerService.getUsers({ parentId: userId, roles: 'submember' }),
      this.jsonServerService.getTransactions({ clubId }),
    ]);

    const allowedUserIds = new Set([userId, ...subMembers.map((s) => toStr(s.id))]);

    const transactions: Tx[] = [];
    const pendingCharges: Tx[] = [];

    for (const tx of clubTransactions) {
      if (!allowedUserIds.has(toStr(tx.userId))) continue;
      transactions.push(tx);
      if (tx.status === 'pending') pendingCharges.push(tx);
    }

    return {
      success: true,
      data: {
        transactions,
        pendingCharges,
        pendingApprovals: pendingCharges.length,
      },
    };
  } catch (error: any) {
    throw new InternalServerErrorException(error?.message ?? 'Failed to fetch transactions');
  }
}



  async getTransactionsByCategory(category: string) {
    const transactions = await this.jsonServerService.getTransactions({ category });
    return transactions;
  }
  async getTransactionFeed(req: any) {
  try {
    const user = req.user;
    const memberId = String(user.id); // parent member id
    const role = user.roles;
    const clubId = String(user.currently_at);

    let transactions: Tx[] = [];

    if (role === 'member') {
      // 1) Get all users + club transactions
      const [allUsers, clubTx] = await Promise.all([
        this.jsonServerService.getUsers(),
        this.jsonServerService.getTransactions({ clubId }),
      ]);

      // 2) Find sub-members under this member (via parentId, not userId anymore)
      const subMembers = allUsers.filter(
        (u: any) => String(u.parentId) === memberId && u.roles === 'submember'
      );
      const subMemberIds = new Set(subMembers.map((s: any) => String(s.id)));

      // 3) Keep member’s + sub-members’ transactions
      transactions = (clubTx as Tx[]).filter(
        (tx) =>
          String(tx.userId) === memberId ||
          (tx.userId && subMemberIds.has(String(tx.userId)))
      );

      // 4) Enrich with userName
      const userById = new Map(allUsers.map((u: any) => [String(u.id), u]));
      const enriched = transactions.map((tx: any) => ({
        ...tx,
        userName: userById.get(String(tx.userId))?.fullname || 'Unknown',
      }));

      return this.formatMemberTransactionFeed(enriched);
    } else {
      // role = submember
      const subMemberId = String(user.id);
      const [allUsers, clubTx] = await Promise.all([
        this.jsonServerService.getUsers(),
        this.jsonServerService.getTransactions({ clubId }),
      ]);

      transactions = (clubTx as Tx[]).filter(
        (tx) => String(tx.userId) === subMemberId
      );

      // Enrich with userName
      const userById = new Map(allUsers.map((u: any) => [String(u.id), u]));
      const enriched = transactions.map((tx: any) => ({
        ...tx,
        userName: userById.get(String(tx.userId))?.fullname || 'Unknown',
      }));

      return this.formatSubMemberTransactionFeed(enriched);
    }
  } catch (error: any) {
    throw new InternalServerErrorException(
      error?.message || 'Failed to fetch transaction feed',
    );
  }
}

  private formatMemberTransactionFeed(
  transactions: Tx[],
  userById?: Map<string, { fullname?: string }>
) {
  const nameOf = (tx: any) =>
    tx.userName ||
    userById?.get(String(tx.userId))?.fullname ||
    'Unknown';

  const pendingUnverified = transactions
    .filter((tx) => tx.status === 'pending' && !tx.verifyCharge)
    .sort((a, b) => this.txTime(b) - this.txTime(a))
    .map((tx) => ({ ...tx, userName: nameOf(tx) }));

  const remaining = transactions.filter(
    (tx) => !(tx.status === 'pending' && !tx.verifyCharge)
  );

  const groupedTransactions = this.groupTransactionsByDay(
    remaining.map((tx) => ({ ...tx, userName: nameOf(tx) }))
  );

  return {
    success: true,
    message: 'Transactions fetched successfully',
    data: {
      pendingUnverified,
      transactions: groupedTransactions,
    },
  };
}

  private formatSubMemberTransactionFeed(transactions: Tx[]) {
  const groupedTransactions = this.groupTransactionsByDay(transactions);
  return {
    success: true,
    message: 'Transactions fetched successfully',
    data: { transactions: groupedTransactions },
  };
}

private groupTransactionsByDay(transactions: Tx[]) {
  const grouped = transactions.reduce((groups: any, tx: Tx) => {
    // prefer createdAt, fallback to date, then updatedAt
    const t = tx.createdAt ?? tx.date ?? tx.updatedAt;
    const d = t ? new Date(t) : new Date(NaN);
    if (isNaN(d.getTime())) return groups;

    const day = d.toISOString().split('T')[0];
    if (!groups[day]) {
      groups[day] = { date: day, totalSpent: 0, items: [] as Tx[] };
    }
    groups[day].items.push(tx);
    groups[day].totalSpent += Number(tx.bill) || 0;
    return groups;
  }, {});

  return Object.values(grouped).sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

private txTime(tx: Tx): number {
  const t = tx.createdAt ?? tx.date ?? tx.updatedAt;
  const n = t ? new Date(t).getTime() : NaN;
  return Number.isFinite(n) ? n : 0;
}
  async getfilertedTransactionFeed(req: any, filters: any = {}) {
    try {
      const user = req.user;
      const userId = String(user.id);
      const userRole = user.roles;
      
      // Remove the initial empty array and let TypeScript infer from the assignment
      let transactions;

      if (userRole === 'member') {
        // Member sees all transactions (member + sub-members)
        const clubId = String(user.currently_at);
        const [allUsers, clubTransactions] = await Promise.all([
          this.jsonServerService.getUsers(),
          this.jsonServerService.getTransactions({ clubId }),
        ]);

        const subMembers = allUsers.filter(
          (u: any) => String(u.parentId) === userId && u.roles === 'submember'
        );

        const allowedUserIds = new Set<string>([
          userId,
          ...subMembers.map((s: any) => String(s.id)),
        ]);

        transactions = clubTransactions.filter(
          (tx: any) => allowedUserIds.has(String(tx.userId))
        );
      } else {
        // Sub-member sees only their own transactions
        transactions = await this.jsonServerService.getTransactions({ 
          userId,
          clubId: user.currently_at 
        });
      }
      
      // Apply filters
      if (filters.status) {
        transactions = transactions.filter((tx: any) => tx.status === filters.status);
      }
      
      if (filters.category) {
        transactions = transactions.filter((tx: any) => tx.category === filters.category);
      }
      
      if (filters.subMemberId && userRole === 'member') {
        transactions = transactions.filter((tx: any) => String(tx.userId) === String(filters.subMemberId));
      }
      
      // Date range filtering
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
              transactions = transactions.filter((tx: any) => {
                const ts = tx.createdAt ?? tx.date ?? tx.updatedAt;
                const txDate = new Date(ts);
                return txDate >= startDate && txDate <= endDate;
              });
            }
            break;
        }
        
        if (filters.dateRange !== 'custom') {
          transactions = transactions.filter((tx: any) => {
            const ts = tx.createdAt ?? tx.date ?? tx.updatedAt;
            const txDate = new Date(ts);
            return txDate >= startDate;
          });
        }
      }
      
      // Group transactions by day
      const groupedTransactions = transactions.reduce((groups: any, transaction: any) => {
        const ts = transaction.createdAt ?? transaction.date ?? transaction.updatedAt;
        const date = new Date(ts).toISOString().split('T')[0];
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
      
      // Convert to array and sort by date
      const feedData = Object.values(groupedTransactions).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Count applied filters
      const appliedFilters = Object.keys(filters).filter(key => filters[key] !== undefined && filters[key] !== null && filters[key] !== '');
      const filtersCount = appliedFilters.length;

      // Unified pending info (works for member or submember)
      const pendingUnverified = transactions.filter((tx: any) => tx.status === 'pending' && !tx.verifyCharge);
      const pendingApprovals = pendingUnverified.length;

      return {
        success: true,
        message: 'Transaction feed retrieved successfully',
        data: {
          transactionsByDay: feedData,
          totalTransactions: transactions.length,
          totalSpent: transactions.reduce((sum: number, tx: any) => sum + (Number(tx.bill) || 0), 0),
          filtersApplied: filtersCount,
          appliedFilters: appliedFilters,
          pendingUnverified,
          pendingApprovals
        }
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async verifyCharge(id: string, req) {
    try {
      const userId = req.user.id;
      const userRole = req.user.roles;
      
      // Only members can verify charges
      if (userRole !== 'member') {
        throw new UnauthorizedException('Only members can verify charges');
      }
      
      const transaction = await this.jsonServerService.getTransaction(id);
      console.log(transaction);
      
      // Check if transaction belongs to member or their sub-members
      const allUsers = await this.jsonServerService.getUsers();
      const subMembers = allUsers.filter(
        (u: any) => String(u.parentId) === String(userId) && u.roles === 'submember'
      );
      
      const allowedUserIds = new Set<string>([
        String(userId),
        ...subMembers.map((s: any) => String(s.id)),
      ]);
      
      if (!allowedUserIds.has(String(transaction.userId))) {
        throw new UnauthorizedException('You can only verify charges for yourself or your sub-members');
      }
      
      if (transaction.status !== 'pending') {
        throw new BadRequestException('Only pending transactions can be verified');
      }
      
      if (transaction.verifyCharge) {
        throw new BadRequestException('Transaction is already verified');
      }
      
      const updatedTransaction = await this.jsonServerService.updateTransaction(id, {
        verifyCharge: true,
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      
      return { 
        success: true, 
        message: 'Charge verified successfully',
        // data: updatedTransaction 
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
