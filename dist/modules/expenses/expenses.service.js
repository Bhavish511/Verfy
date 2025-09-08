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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const json_server_service_1 = require("../../services/json-server.service");
let ExpensesService = class ExpensesService {
    httpService;
    jsonServerService;
    constructor(httpService, jsonServerService) {
        this.httpService = httpService;
        this.jsonServerService = jsonServerService;
    }
    create(createExpenseDto) {
        return 'This action adds a new expense';
    }
    async findAll(req) {
        try {
            const userId = req.user.id;
            const dailyExpenses = await this.jsonServerService.getDailyExpenses({ userId });
            return { success: true, data: dailyExpenses };
        }
        catch (error) {
            console.log(error.message);
        }
    }
    findOne(id) {
        return `This action returns a #${id} expense`;
    }
    update(id, updateExpenseDto) {
        return `This action updates a #${id} expense`;
    }
    remove(id) {
        return `This action removes a #${id} expense`;
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        json_server_service_1.JsonServerService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map