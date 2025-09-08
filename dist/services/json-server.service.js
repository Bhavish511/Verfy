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
var JsonServerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonServerService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let JsonServerService = JsonServerService_1 = class JsonServerService {
    logger = new common_1.Logger(JsonServerService_1.name);
    dbPath = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), 'db.json');
    data;
    constructor() {
        this.loadDatabase();
    }
    loadDatabase() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const fileContent = fs.readFileSync(this.dbPath, 'utf8');
                this.data = JSON.parse(fileContent);
                this.logger.log('Database loaded successfully');
            }
            else {
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
        }
        catch (error) {
            this.logger.error('Error loading database:', error);
            throw error;
        }
    }
    saveDatabase() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
            this.logger.log('Database saved successfully');
        }
        catch (error) {
            this.logger.error('Error saving database:', error);
            throw error;
        }
    }
    async findAll(collection, query) {
        let items = [...this.data[collection]];
        if (query) {
            items = this.filterItems(items, query);
        }
        return items;
    }
    async findOne(collection, id) {
        const items = this.data[collection];
        const item = items.find(item => String(item.id) === String(id));
        if (!item) {
            throw new Error(`Item with id ${id} not found in ${collection}`);
        }
        return item;
    }
    async findOneByField(collection, field, value) {
        const items = this.data[collection];
        const item = items.find((i) => String(i[field]) === String(value));
        if (!item) {
            throw new Error(`Item with ${String(field)}=${value} not found in ${collection}`);
        }
        return item;
    }
    async create(collection, data) {
        try {
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
        }
        catch (error) {
            this.logger.error(`Error creating ${collection}:`, error);
            throw error;
        }
    }
    async update(collection, id, data) {
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
    async delete(collection, id) {
        const items = this.data[collection];
        const index = items.findIndex(item => String(item.id) === String(id));
        if (index === -1) {
            throw new Error(`Item with id ${id} not found in ${collection}`);
        }
        this.data[collection].splice(index, 1);
        this.saveDatabase();
    }
    async findByQuery(collection, query) {
        return this.filterItems(this.data[collection], query);
    }
    filterItems(items, query) {
        if (!query || Object.keys(query).length === 0) {
            return items;
        }
        return items.filter(item => {
            return Object.keys(query).every(key => {
                const queryValue = query[key];
                const itemValue = item[key];
                if (queryValue === null || queryValue === undefined) {
                    return itemValue === queryValue;
                }
                if (typeof queryValue === 'string') {
                    return String(itemValue).toLowerCase().includes(queryValue.toLowerCase());
                }
                return String(itemValue) === String(queryValue);
            });
        });
    }
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    validateCreateData(collection, data) {
        const requiredFields = {
            users: ['fullname', 'email', 'password'],
            clubs: ['name', 'location'],
            finances: ['totalAllowance'],
            transactions: ['clubId', 'bill', 'userId', 'category'],
            flagCharges: ['reasons', 'comment', 'userId'],
            daily_expenses: ['money_spent', 'userId'],
            invitationCode: ['invitationCode', 'memberId'],
            feedbacks: ['userId', 'stars', 'feedbackText'],
            user_clubs: ['userId', 'clubId', 'memberId', 'totalAllowance', 'billingCycle']
        };
        const fields = requiredFields[collection] || [];
        const missingFields = fields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields for ${collection}: ${missingFields.join(', ')}`);
        }
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
    async getDatabaseStats() {
        const stats = {
            users: this.data.users.length,
            clubs: this.data.clubs.length,
            finances: this.data.finances.length,
            transactions: this.data.transactions.length,
            flagCharges: this.data.flagCharges.length,
            daily_expenses: this.data.daily_expenses.length,
            invitationCode: this.data.invitationCode.length,
            feedbacks: this.data.feedbacks.length,
            user_clubs: this.data.user_clubs.length,
            lastUpdated: new Date().toISOString()
        };
        return stats;
    }
    async backupDatabase() {
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
    async restoreDatabase(backupPath) {
        try {
            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }
            const backupContent = fs.readFileSync(backupPath, 'utf8');
            const backupData = JSON.parse(backupContent);
            delete backupData.backupCreatedAt;
            delete backupData.version;
            this.data = backupData;
            this.saveDatabase();
            this.logger.log(`Database restored from: ${backupPath}`);
        }
        catch (error) {
            this.logger.error('Error restoring database:', error);
            throw error;
        }
    }
    async getUsers(query) {
        return this.findAll('users', query);
    }
    async getUser(id) {
        return this.findOne('users', id);
    }
    async getUserbyEmail(email) {
        return this.findOneByField('users', 'email', email);
    }
    async createUser(data) {
        return this.create('users', data);
    }
    async updateUser(id, data) {
        return this.update('users', id, data);
    }
    async deleteUser(id) {
        return this.delete('users', id);
    }
    async getClubs(query) {
        return this.findAll('clubs', query);
    }
    async getClub(id) {
        return this.findOne('clubs', id);
    }
    async createClub(data) {
        return this.create('clubs', data);
    }
    async updateClub(id, data) {
        return this.update('clubs', id, data);
    }
    async deleteClub(id) {
        return this.delete('clubs', id);
    }
    async getFinances(query) {
        return this.findAll('finances', query);
    }
    async getFinance(id) {
        return this.findOne('finances', id);
    }
    async createFinance(data) {
        return this.create('finances', data);
    }
    async updateFinance(id, data) {
        return this.update('finances', id, data);
    }
    async deleteFinance(id) {
        return this.delete('finances', id);
    }
    async getTransactions(query) {
        return this.findAll('transactions', query);
    }
    async getTransaction(id) {
        return this.findOne('transactions', id);
    }
    async createTransaction(data) {
        return this.create('transactions', data);
    }
    async updateTransaction(id, data) {
        return this.update('transactions', id, data);
    }
    async deleteTransaction(id) {
        return this.delete('transactions', id);
    }
    async getFlagCharges(query) {
        return this.findAll('flagCharges', query);
    }
    async getFlagCharge(id) {
        return this.findOne('flagCharges', id);
    }
    async createFlagCharge(data) {
        return this.create('flagCharges', data);
    }
    async updateFlagCharge(id, data) {
        return this.update('flagCharges', id, data);
    }
    async deleteFlagCharge(id) {
        return this.delete('flagCharges', id);
    }
    async getDailyExpenses(query) {
        return this.findAll('daily_expenses', query);
    }
    async getDailyExpense(id) {
        return this.findOne('daily_expenses', id);
    }
    async createDailyExpense(data) {
        return this.create('daily_expenses', data);
    }
    async updateDailyExpense(id, data) {
        return this.update('daily_expenses', id, data);
    }
    async deleteDailyExpense(id) {
        return this.delete('daily_expenses', id);
    }
    async getInvitationCodes(query) {
        return this.findAll('invitationCode', query);
    }
    async getInvitationCode(id) {
        return this.findOne('invitationCode', id);
    }
    async createInvitationCode(data) {
        return this.create('invitationCode', data);
    }
    async updateInvitationCode(id, data) {
        return this.update('invitationCode', id, data);
    }
    async deleteInvitationCode(id) {
        return this.delete('invitationCode', id);
    }
    async getUserClubs(query) {
        return this.findAll('user_clubs', query);
    }
    async getUserClub(id) {
        return this.findOne('user_clubs', id);
    }
    async createUserClub(data) {
        return this.create('user_clubs', data);
    }
    async updateUserClub(id, data) {
        return this.update('user_clubs', id, data);
    }
    async getClubsForUser(userId) {
        return this.findAll('user_clubs', { userId: userId });
    }
    async getClubsForParentMember(parentMemberId) {
        return this.findAll('user_clubs', { parentMemberId: parentMemberId });
    }
    async deleteUserClub(id) {
        return this.delete('user_clubs', id);
    }
    async getFeedbacks(query) {
        return this.findAll('feedbacks', query);
    }
    async getFeedback(id) {
        return this.findOne('feedbacks', id);
    }
    async createFeedback(data) {
        return this.create('feedbacks', data);
    }
    async updateFeedback(id, data) {
        return this.update('feedbacks', id, data);
    }
    async deleteFeedback(id) {
        return this.delete('feedbacks', id);
    }
};
exports.JsonServerService = JsonServerService;
exports.JsonServerService = JsonServerService = JsonServerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JsonServerService);
//# sourceMappingURL=json-server.service.js.map