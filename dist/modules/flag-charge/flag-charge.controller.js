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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagChargeController = void 0;
const common_1 = require("@nestjs/common");
const flag_charge_service_1 = require("./flag-charge.service");
const create_flag_charge_dto_1 = require("./dto/create-flag-charge.dto");
const auth_guard_1 = require("../auth/auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
let FlagChargeController = class FlagChargeController {
    flagChargeService;
    constructor(flagChargeService) {
        this.flagChargeService = flagChargeService;
    }
    create(createFlagChargeDto, id, req, file) {
        return this.flagChargeService.create(createFlagChargeDto, id, req, file);
    }
    findAll() {
        return this.flagChargeService.findAll();
    }
};
exports.FlagChargeController = FlagChargeController;
__decorate([
    (0, common_1.Post)(':transactionId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('transactionId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flag_charge_dto_1.CreateFlagChargeDto, String, Object, Object]),
    __metadata("design:returntype", void 0)
], FlagChargeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlagChargeController.prototype, "findAll", null);
exports.FlagChargeController = FlagChargeController = __decorate([
    (0, common_1.Controller)('flag-charge'),
    __metadata("design:paramtypes", [flag_charge_service_1.FlagChargeService])
], FlagChargeController);
//# sourceMappingURL=flag-charge.controller.js.map