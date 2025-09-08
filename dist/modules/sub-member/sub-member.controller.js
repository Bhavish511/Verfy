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
exports.SubMemberController = void 0;
const common_1 = require("@nestjs/common");
const sub_member_service_1 = require("./sub-member.service");
const create_sub_member_dto_1 = require("./dto/create-sub-member.dto");
const auth_guard_1 = require("../auth/auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_enum_1 = require("../auth/roles.enum");
let SubMemberController = class SubMemberController {
    subMemberService;
    constructor(subMemberService) {
        this.subMemberService = subMemberService;
    }
    createSubMember(createSubMemberDto, req) {
        return this.subMemberService.createSubMember(createSubMemberDto, req);
    }
    removeSubMember(id) {
        return this.subMemberService.removeSubMember(id);
    }
    editAllowance(id, body, req) {
        return this.subMemberService.editAllowance(id, body.allowance);
    }
    getsubDashboard(id) {
        return this.subMemberService.getsubDashboard(id);
    }
    getDashboard(req) {
        return this.subMemberService.getDashboard(req);
    }
    getDashboardView(req, view) {
        return this.subMemberService.getSubMemberDashboardSummary(req, view);
    }
    findAllSubMembers(req) {
        return this.subMemberService.getAllSubMembers(req);
    }
    switchClub(clubId, req) {
        return this.subMemberService.switchClub(clubId, req);
    }
    validateInvitationCode(body) {
        return this.subMemberService.validateInvitationCode(body.invitationCode);
    }
};
exports.SubMemberController = SubMemberController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.MEMBER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sub_member_dto_1.CreateSubMemberDto, Object]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "createSubMember", null);
__decorate([
    (0, common_1.Post)('remove-sub-member/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.MEMBER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "removeSubMember", null);
__decorate([
    (0, common_1.Post)('edit-allowance/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.MEMBER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "editAllowance", null);
__decorate([
    (0, common_1.Get)('get-subdashboard/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "getsubDashboard", null);
__decorate([
    (0, common_1.Get)('get-dashboard'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUBMEMBER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('dashboard-view'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUBMEMBER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('view')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "getDashboardView", null);
__decorate([
    (0, common_1.Get)('get-all'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.MEMBER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "findAllSubMembers", null);
__decorate([
    (0, common_1.Post)("switch-club/:clubId"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.SUBMEMBER),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "switchClub", null);
__decorate([
    (0, common_1.Post)('validate-invitation-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SubMemberController.prototype, "validateInvitationCode", null);
exports.SubMemberController = SubMemberController = __decorate([
    (0, common_1.Controller)('submember'),
    __metadata("design:paramtypes", [sub_member_service_1.SubMemberService])
], SubMemberController);
//# sourceMappingURL=sub-member.controller.js.map