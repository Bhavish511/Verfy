"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubsModule = void 0;
const common_1 = require("@nestjs/common");
const clubs_service_1 = require("./clubs.service");
const clubs_controller_1 = require("./clubs.controller");
const auth_module_1 = require("../auth/auth.module");
const json_server_service_1 = require("../../services/json-server.service");
let ClubsModule = class ClubsModule {
};
exports.ClubsModule = ClubsModule;
exports.ClubsModule = ClubsModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [clubs_controller_1.ClubsController],
        providers: [clubs_service_1.ClubsService, json_server_service_1.JsonServerService],
    })
], ClubsModule);
//# sourceMappingURL=clubs.module.js.map