"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EovModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const eov_controller_1 = require("./eov.controller");
const eov_service_1 = require("./eov.service");
const auth_module_1 = require("../auth/auth.module");
const json_server_module_1 = require("../json-server/json-server.module");
let EovModule = class EovModule {
};
exports.EovModule = EovModule;
exports.EovModule = EovModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, axios_1.HttpModule, json_server_module_1.JsonServerModule],
        controllers: [eov_controller_1.EovController],
        providers: [eov_service_1.EovService],
    })
], EovModule);
//# sourceMappingURL=eov.module.js.map