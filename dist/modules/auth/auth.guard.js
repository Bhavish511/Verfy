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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const auth_service_1 = require("./auth.service");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let AuthGuard = class AuthGuard {
    authService;
    jwtService;
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            let auth = request.headers['authorization'];
            let token;
            if (auth && auth.startsWith('Bearer')) {
                token = auth.split(' ')[1];
            }
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.ACCESS_TOKEN_SECRET
            });
            if (!decoded) {
                throw new common_1.UnauthorizedException('token expired!');
            }
            const user = await this.authService.findOne(decoded.id);
            if (!user) {
                throw new common_1.UnauthorizedException("User doesn't exist!");
            }
            request.user = user;
            request.token = token;
            return true;
        }
        catch (error) {
            console.log("hello");
            throw new common_1.UnauthorizedException(error.message);
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map