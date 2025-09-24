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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const LoginDto_1 = require("./dto/LoginDto");
const update_auth_dto_1 = require("./dto/update-auth.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const forgetpassword_dto_1 = require("./dto/forgetpassword.dto");
const auth_guard_1 = require("./auth.guard");
const CompleteLogin_dto_1 = require("./dto/CompleteLogin.dto");
const submember_credentials_dto_1 = require("./dto/submember-credentials.dto");
const platform_express_1 = require("@nestjs/platform-express");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    getFullDatabase() {
        return this.authService.getFullDatabase();
    }
    signUp(loginDto) {
        return this.authService.signUp(loginDto);
    }
    Login(loginDto) {
        return this.authService.LoginforMember(loginDto);
    }
    verifySubMemberCredentials(verifyCredentialsDto) {
        const { email, password } = verifyCredentialsDto;
        return this.authService.verifySubMemberCredentials(email, password);
    }
    completeSubMemberLogin(completeLoginDto) {
        const { userId, invitationCode } = completeLoginDto;
        return this.authService.completeSubMemberLogin(userId, invitationCode);
    }
    findOneWithEmail(body) {
        return this.authService.findOneWithEmail(body.email);
    }
    update(updateAuthDto) {
        return this.authService.resetPassword(updateAuthDto);
    }
    async logout(req) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return this.authService.logout(token);
    }
    updateProfile(req, updateProfileDto) {
        return this.authService.updateProfile(req.user.id, updateProfileDto);
    }
    updateProfilePicture(req, file) {
        return this.authService.updateProfilePicture(req.user.id, file);
    }
    remove(id) {
        return this.authService.remove(+id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getFullDatabase", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('login-member'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "Login", null);
__decorate([
    (0, common_1.Post)('login-sub-member'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submember_credentials_dto_1.VerifyCredentialsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifySubMemberCredentials", null);
__decorate([
    (0, common_1.Post)('submember/invitationCode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompleteLogin_dto_1.CompleteLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "completeSubMemberLogin", null);
__decorate([
    (0, common_1.Post)('forget-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgetpassword_dto_1.ForgetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "findOneWithEmail", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_auth_dto_1.UpdateAuthDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Patch)('update-profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('update-profile-picture'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateProfilePicture", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "remove", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map