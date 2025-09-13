import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface DatabaseData {
  users: any[];
  clubs: any[];
  finances: any[];
  transactions: any[];
  flagCharges: any[];
  daily_expenses: any[];
  invitationCode: any[];
  feedbacks: any[];
  user_clubs: any[];
}

@Injectable()
export class JsonServerService {
  private readonly logger = new Logger(JsonServerService.name);
  private readonly dbPath = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), 'db.json');
  private data: DatabaseData;

  constructor() {
    this.loadDatabase();
  }

  private loadDatabase(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
        this.logger.log('Database loaded successfully');
      } else {
        // Initialize with empty database structure
        this.data = {
          users: [],
          clubs: [],
          finances: [],
          transactions: [],
          flagCharges: [],
          daily_expenses: [],
          invitationCode: [],
          feedbacks: [],
          user_clubs: []
        };
        this.saveDatabase();
        this.logger.log('New database created');
      }
    } catch (error) {
      this.logger.error('Error loading database:', error);
      throw error;
    }
  }

  private saveDatabase(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
      this.logger.log('Database saved successfully');
    } catch (error) {
      this.logger.error('Error saving database:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async findAll(collection: keyof DatabaseData, query?: any): Promise<any[]> {
    let items = [...this.data[collection]];
    
    if (query) {
      items = this.filterItems(items, query);
    }
    
    return items;
  }

  async findOne(collection: keyof DatabaseData, id: string | number): Promise<any> {
    const items = this.data[collection];
    const item = items.find(item => String(item.id) === String(id));
    if (!item) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    
    return item;
  }
  async findOneByField<T extends keyof DatabaseData>(
  collection: T,
  field: keyof DatabaseData[T][number],
  value: string | number,
  ): Promise<DatabaseData[T][number]> {
    const items = this.data[collection];
    const item = items.find((i: any) => String(i[field]) === String(value));

    if (!item) {
      throw new Error(`Item with ${String(field)}=${value} not found in ${collection}`);
    }

    return item;
  }


  async create(collection: keyof DatabaseData, data: any): Promise<any> {
    try {
      // Validate required fields based on collection type
      this.validateCreateData(collection, data);
      
      const newItem = {
        id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.data[collection].push(newItem);
      this.saveDatabase();
      
      this.logger.log(`Created new ${collection} with ID: ${newItem.id}`);
      return newItem;
    } catch (error) {
      this.logger.error(`Error creating ${collection}:`, error);
      throw error;
    }
  }

  async update(collection: keyof DatabaseData, id: string | number, data: any): Promise<any> {
    const items = this.data[collection];
    const index = items.findIndex(item => String(item.id) === String(id));
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    
    const updatedItem = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.data[collection][index] = updatedItem;
    this.saveDatabase();
    
    return updatedItem;
  }

  async delete(collection: keyof DatabaseData, id: string | number): Promise<void> {
    const items = this.data[collection];
    const index = items.findIndex(item => String(item.id) === String(id));
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }
    
    this.data[collection].splice(index, 1);
    this.saveDatabase();
  }

  // Query operations
  async findByQuery(collection: keyof DatabaseData, query: any): Promise<any[]> {
    return this.filterItems(this.data[collection], query);
  }

  private filterItems(items: any[], query: any): any[] {
    if (!query || Object.keys(query).length === 0) {
      return items;
    }
    
    return items.filter(item => {
      return Object.keys(query).every(key => {
        const queryValue = query[key];
        const itemValue = item[key];
        
        // Handle null/undefined values
        if (queryValue === null || queryValue === undefined) {
          return itemValue === queryValue;
        }
        
        // Handle string matching (case-insensitive partial match)
        if (typeof queryValue === 'string') {
          return String(itemValue).toLowerCase().includes(queryValue.toLowerCase());
        }
        
        // Handle exact matching for other types
        return String(itemValue) === String(queryValue);
      });
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private validateCreateData(collection: keyof DatabaseData, data: any): void {
    const requiredFields: Record<keyof DatabaseData, string[]> = {
      users: ['fullname', 'email', 'password'],
      clubs: ['name', 'location'],
      finances: ['totalAllowance'],
      transactions: ['clubId', 'bill', 'userId', 'category'],
      flagCharges: ['reasons', 'comment', 'userId'],
      daily_expenses: ['money_spent', 'userId'],
      invitationCode: ['invitationCode', 'memberId'],
      feedbacks: ['userId', 'stars', 'feedbackText'],
      user_clubs: ['userId','clubId','memberId','totalAllowance','billingCycle']
    };

    const fields = requiredFields[collection] || [];
    const missingFields = fields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for ${collection}: ${missingFields.join(', ')}`);
    }

    // Additional validation for specific collections
    if (collection === 'users' && data.email) {
      const existingUser = this.data.users.find(user => user.email === data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    if (collection === 'finances' && data.totalAllowance < 0) {
      throw new Error('Total allowance cannot be negative');
    }

    if (collection === 'transactions' && data.bill <= 0) {
      throw new Error('Transaction bill must be greater than 0');
    }
  }

  // Optimized method to get database statistics
  async getDatabaseStats(): Promise<any> {
    const stats = {
      users: this.data.users.length,
      clubs: this.data.clubs.length,
      finances: this.data.finances.length,
      transactions: this.data.transactions.length,
      flagCharges: this.data.flagCharges.length,
      daily_expenses: this.data.daily_expenses.length,
      invitationCode: this.data.invitationCode.length,
      feedbacks: this.data.feedbacks.length,
      user_clubs:this.data.user_clubs.length,
      lastUpdated: new Date().toISOString()
    };
    return stats;
  }

  // Optimized method to backup database
  async backupDatabase(): Promise<string> {
    const backupData = {
      ...this.data,
      backupCreatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    const backupPath = path.join(process.cwd(), `db-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    this.logger.log(`Database backup created: ${backupPath}`);
    return backupPath;
  }

  // Optimized method to restore database from backup
  async restoreDatabase(backupPath: string): Promise<void> {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);
      
      // Remove backup metadata
      delete backupData.backupCreatedAt;
      delete backupData.version;
      
      this.data = backupData;
      this.saveDatabase();
      this.logger.log(`Database restored from: ${backupPath}`);
    } catch (error) {
      this.logger.error('Error restoring database:', error);
      throw error;
    }
  }
  // Specific collection methods for easier access
  async getUsers(query?: any): Promise<any[]> {
    return this.findAll('users', query);
  }

  async getUser(id: string | number): Promise<any> {
    return this.findOne('users', id);
  }
  async getUserbyEmail(email: string): Promise<any> {
    return this.findOneByField('users', 'email', email);
  }

  async createUser(data: any): Promise<any> {
    return this.create('users', data);
  }

  async updateUser(id: string | number, data: any): Promise<any> {
    return this.update('users', id, data);
  }

  async deleteUser(id: string | number): Promise<void> {
    return this.delete('users', id);
  }

  async getClubs(query?: any): Promise<any[]> {
    return this.findAll('clubs', query);
  }

  async getClub(id: string | number): Promise<any> {
    return this.findOne('clubs', id);
  }

  async createClub(data: any): Promise<any> {
    return this.create('clubs', data);
  }

  async updateClub(id: string | number, data: any): Promise<any> {
    return this.update('clubs', id, data);
  }

  async deleteClub(id: string | number): Promise<void> {
    return this.delete('clubs', id);
  }

  async getFinances(query?: any): Promise<any[]> {
    return this.findAll('finances', query);
  }

  async getFinance(id: string | number): Promise<any> {
    return this.findOne('finances', id);
  }

  async createFinance(data: any): Promise<any> {
    return this.create('finances', data);
  }

  async updateFinance(id: string | number, data: any): Promise<any> {
    return this.update('finances', id, data);
  }

  async deleteFinance(id: string | number): Promise<void> {
    return this.delete('finances', id);
  }

  async getTransactions(query?: any): Promise<any[]> {
    return this.findAll('transactions', query);
  }

  async getTransaction(id: string | number ): Promise<any> {
    return this.findOne('transactions', id);
  }

  async createTransaction(data: any): Promise<any> {
    return this.create('transactions', data);
  }

  async updateTransaction(id: string | number, data: any): Promise<any> {
    return this.update('transactions', id, data);
  }

  async deleteTransaction(id: string | number): Promise<void> {
    return this.delete('transactions', id);
  }

  async getFlagCharges(query?: any): Promise<any[]> {
    return this.findAll('flagCharges', query);
  }

  async getFlagCharge(id: string | number): Promise<any> {
    return this.findOne('flagCharges', id);
  }

  async createFlagCharge(data: any): Promise<any> {
    return this.create('flagCharges', data);
  }

  async updateFlagCharge(id: string | number, data: any): Promise<any> {
    return this.update('flagCharges', id, data);
  }

  async deleteFlagCharge(id: string | number): Promise<void> {
    return this.delete('flagCharges', id);
  }

  async getDailyExpenses(query?: any): Promise<any[]> {
    return this.findAll('daily_expenses', query);
  }

  async getDailyExpense(id: string | number): Promise<any> {
    return this.findOne('daily_expenses', id);
  }

  async createDailyExpense(data: any): Promise<any> {
    return this.create('daily_expenses', data);
  }

  async updateDailyExpense(id: string | number, data: any): Promise<any> {
    return this.update('daily_expenses', id, data);
  }

  async deleteDailyExpense(id: string | number): Promise<void> {
    return this.delete('daily_expenses', id);
  }

  async getInvitationCodes(query?: any): Promise<any[]> {
    return this.findAll('invitationCode', query);
  }

  async getInvitationCode(id: string | number): Promise<any> {
    return this.findOne('invitationCode', id);
  }

  async createInvitationCode(data: any): Promise<any> {
    return this.create('invitationCode', data);
  }

  async updateInvitationCode(id: string | number, data: any): Promise<any> {
    return this.update('invitationCode', id, data);
  }

  async deleteInvitationCode(id: string | number): Promise<void> {
    return this.delete('invitationCode', id);
  }

  //user_clubs
  async getUserClubs(query?: any): Promise<any[]> {
    return this.findAll('user_clubs', query);
  }

  async getUserClub(id: string | number): Promise<any> {
    return this.findOne('user_clubs', id);
  }

  async createUserClub(data: any): Promise<any> {
    return this.create('user_clubs', data);
  }

  async updateUserClub(id: string | number, data: any): Promise<any> {
    return this.update('user_clubs', id, data);
  }

  // Helper method to get clubs for a specific member or sub-member
  async getClubsForUser(userId: string | number): Promise<any[]> {
    return this.findAll('user_clubs', { memberId: userId, userId:userId});
  }
  async getClubsFormember(userId: string | number): Promise<any[]> {
    return this.findAll('user_clubs', { userId: userId });
  }
  // Helper method to get clubs for a parent member (including sub-members)
  async getClubsForParentMember(memberId: string | number): Promise<any[]> {
    return this.findAll('user_clubs', { memberId: memberId });
  }


  async deleteUserClub(id: string | number): Promise<void> {
    return this.delete('user_clubs', id);
  }

  // Feedback methods
  async getFeedbacks(query?: any): Promise<any[]> {
    return this.findAll('feedbacks', query);
  }

  async getFeedback(id: string | number): Promise<any> {
    return this.findOne('feedbacks', id);
  }

  async createFeedback(data: any): Promise<any> {
    return this.create('feedbacks', data);
  }

  async updateFeedback(id: string | number, data: any): Promise<any> {
    return this.update('feedbacks', id, data);
  }

  async deleteFeedback(id: string | number): Promise<void> {
    return this.delete('feedbacks', id);
  }
}
