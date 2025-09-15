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
    create(createClubDto) {
        return this.clubsService.create(createClubDto);
    }
    findAllforMember(req) {
        return this.clubsService.findAllforMember(req);
    }
    findAllforSubMember(req) {
        return this.clubsService.findAllforSubMember(req);
    }
    findOne(id) {
        return this.clubsService.findOne(+id);
    }
    choseClubforMember(id, req) {
        return this.clubsService.choseClubforMember(+id, req);
    }
    remove(id) {
        return this.clubsService.remove(+id);
    }
};
exports.ClubsController = ClubsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_club_dto_1.CreateClubDto]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('club-member/get-clubs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findAllforMember", null);
__decorate([
    (0, common_1.Get)('club-sub-member/get-clubs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUBMEMBER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findAllforSubMember", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUBMEMBER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClubsController.prototype, "choseClubforMember", null);
__decorate([
    (0, common_1.Delete)(':id'),
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