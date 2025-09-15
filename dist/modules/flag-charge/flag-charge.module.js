"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagChargeModule = void 0;
const common_1 = require("@nestjs/common");
const flag_charge_service_1 = require("./flag-charge.service");
const flag_charge_controller_1 = require("./flag-charge.controller");
const axios_1 = require("@nestjs/axios");
const json_server_module_1 = require("../json-server/json-server.module");
const auth_module_1 = require("../auth/auth.module");
let FlagChargeModule = class FlagChargeModule {
};
exports.FlagChargeModule = FlagChargeModule;
exports.FlagChargeModule = FlagChargeModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, auth_module_1.AuthModule, json_server_module_1.JsonServerModule],
        controllers: [flag_charge_controller_1.FlagChargeController],
        providers: [flag_charge_service_1.FlagChargeService],
    })
], FlagChargeModule);
//# sourceMappingURL=flag-charge.module.js.map