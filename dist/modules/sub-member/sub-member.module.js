"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubMemberModule = void 0;
const common_1 = require("@nestjs/common");
const sub_member_service_1 = require("./sub-member.service");
const sub_member_controller_1 = require("./sub-member.controller");
const axios_1 = require("@nestjs/axios");
const json_server_module_1 = require("../json-server/json-server.module");
const auth_module_1 = require("../auth/auth.module");
const transactions_module_1 = require("../transactions/transactions.module");
let SubMemberModule = class SubMemberModule {
};
exports.SubMemberModule = SubMemberModule;
exports.SubMemberModule = SubMemberModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule.register({ timeout: 8000 }), auth_module_1.AuthModule, json_server_module_1.JsonServerModule, transactions_module_1.TransactionsModule],
        controllers: [sub_member_controller_1.SubMemberController],
        providers: [sub_member_service_1.SubMemberService],
        exports: [sub_member_service_1.SubMemberService]
    })
], SubMemberModule);
//# sourceMappingURL=sub-member.module.js.map