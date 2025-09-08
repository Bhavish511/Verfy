"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const member_module_1 = require("./modules/member/member.module");
const sub_member_module_1 = require("./modules/sub-member/sub-member.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const auth_module_1 = require("./modules/auth/auth.module");
const clubs_module_1 = require("./modules/clubs/clubs.module");
const finance_module_1 = require("./modules/finance/finance.module");
const axios_1 = require("@nestjs/axios");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const flag_charge_module_1 = require("./modules/flag-charge/flag-charge.module");
const email_module_1 = require("./modules/email/email.module");
const eov_module_1 = require("./modules/eov/eov.module");
const feedback_module_1 = require("./modules/feedback/feedback.module");
const json_server_module_1 = require("./modules/json-server/json-server.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            json_server_module_1.JsonServerModule,
            member_module_1.MemberModule,
            sub_member_module_1.SubMemberModule,
            transactions_module_1.TransactionsModule,
            auth_module_1.AuthModule,
            clubs_module_1.ClubsModule,
            finance_module_1.FinanceModule,
            expenses_module_1.ExpensesModule,
            flag_charge_module_1.FlagChargeModule,
            email_module_1.EmailModule,
            eov_module_1.EovModule,
            feedback_module_1.FeedbackModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map