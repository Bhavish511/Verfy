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
exports.ClubsController = void 0;
const common_1 = require("@nestjs/common");
const clubs_service_1 = require("./clubs.service");
const create_club_dto_1 = require("./dto/create-club.dto");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_enum_1 = require("../auth/roles.enum");
let ClubsController = class ClubsController {
    clubsService;
    constructor(clubsService) {
        this.clubsService = clubsService;
    }
    create(req, createClubDto) {
        const userId = req.user?.id || req.user?.userId;
        return this.clubsService.createClub(userId, createClubDto);
    }
    findAllForMember(req) {
        const userId = req.user?.id || req.user?.userId;
        return this.clubsService.findAllForMember(userId);
    }
    findAllForSubMember(req) {
        const userId = req.user?.id || req.user?.userId;
        return this.clubsService.findAllForSubMember(userId);
    }
    findOne(id) {
        return this.clubsService.getClubDetails(id);
    }
    chooseClubForMember(id, req) {
        const userId = req.user?.id || req.user?.userId;
        return this.clubsService.chooseClubForMember(userId, id);
    }
    remove(id) {
        return this.clubsService.removeClub(id);
    }
};
exports.ClubsController = ClubsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_club_dto_1.CreateClubDto]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('club-member/get-clubs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findAllForMember", null);
__decorate([
    (0, common_1.Get)('club-sub-member/get-clubs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUBMEMBER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findAllForSubMember", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('choose-club/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUBMEMBER, roles_enum_1.Role.MEMBER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "chooseClubForMember", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "remove", null);
exports.ClubsController = ClubsController = __decorate([
    (0, common_1.Controller)('clubs'),
    __metadata("design:paramtypes", [clubs_service_1.ClubsService])
], ClubsController);
//# sourceMappingURL=clubs.controller.js.map