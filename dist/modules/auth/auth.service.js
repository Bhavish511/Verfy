"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const jwt = __importStar(require("jsonwebtoken"));
const email_service_1 = require("../email/email.service");
const json_server_service_1 = require("../../services/json-server.service");
const uploadFileHandler_1 = require("../../utils/uploadFileHandler");
let AuthService = class AuthService {
    httpService;
    emailService;
    jsonServerService;
    constructor(httpService, emailService, jsonServerService) {
        this.httpService = httpService;
        this.emailService = emailService;
        this.jsonServerService = jsonServerService;
    }
    fields = {
        financeId: null,
        currently_at: null,
        roles: 'member',
        userId: null,
        transactionId: null,
        dailyExpensesId: null,
    };
    async signUp({ email, password, fullname, }) {
        try {
            const existingUsers = await this.jsonServerService.getUsers({ email });
            if (existingUsers && existingUsers.length > 0) {
                throw new common_1.BadRequestException('User with this email already exists!');
            }
            const finance = await this.jsonServerService.createFinance({
                totalAllowance: 0,
                totalSpent: 0,
            });
            const newMember = await this.jsonServerService.createUser({
                fullname: fullname || 'New Member',
                email,
                password,
                roles: 'member',
                financeId: finance.id,
                currently_at: null,
                userId: null,
                phone: null,
                address: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Member registered successfully!',
                data: {
                    user: {
                        id: newMember.id,
                        fullname: newMember.fullname,
                        email: newMember.email,
                        roles: newMember.roles,
                    },
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Registration failed',
                error: error.message,
            };
        }
    }
    async LoginforMember({ email, password }) {
        try {
            const users = await this.jsonServerService.getUsers({ email });
            const user = users[0];
            if (!user)
                throw new common_1.BadRequestException('Incorrect email or password!');
            if (user.password !== password)
                throw new common_1.BadRequestException('Incorrect email or password!');
            if (user.roles === 'submember') {
                throw new common_1.UnauthorizedException('Sub-members are not allowed to login as member');
            }
            const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d',
            });
            const { password: _, ...userWithoutPassword } = user;
            return {
                success: true,
                message: 'Login Successful!',
                data: { user: userWithoutPassword, accessToken },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async verifySubMemberCredentials(email, password) {
        try {
            if (!email || !password) {
                throw new common_1.BadRequestException('Email and password are required!');
            }
            const users = await this.jsonServerService.getUsers({ email });
            const user = users[0];
            if (!user) {
                throw new common_1.BadRequestException('Incorrect email or password!');
            }
            if (user.password !== password) {
                throw new common_1.BadRequestException('Incorrect email or password!');
            }
            if (user.roles !== 'submember') {
                throw new common_1.BadRequestException('This endpoint is only for sub-members!');
            }
            return {
                success: true,
                message: 'Credentials verified. Please provide invitation code.',
                data: {
                    userId: user.id,
                    email: user.email,
                    role: user.roles
                }
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Verification failed');
        }
    }
    async completeSubMemberLogin(userId, invitationCode) {
        try {
            console.log(userId);
            console.log(invitationCode);
            if (!userId || !invitationCode) {
                throw new common_1.BadRequestException('User ID and invitation code are required!');
            }
            const users = await this.jsonServerService.getUsers({ id: userId });
            const user = users[0];
            console.log(user);
            if (!user) {
                throw new common_1.BadRequestException('User not found!');
            }
            const invitationCodes = await this.jsonServerService.getInvitationCodes({
                invitationCode,
            });
            const match = invitationCodes[0];
            console.log(match.status);
            console.log(invitationCodes[0]);
            if (!match) {
                throw new common_1.BadRequestException('Invalid invitation code!');
            }
            if (String(match.subMemberId) !== String(userId)) {
                throw new common_1.BadRequestException('Invitation code does not match this sub-member!');
            }
            const now = new Date();
            const expiresAt = new Date(match.expiresAt);
            if (now > expiresAt) {
                await this.jsonServerService.updateInvitationCode(match.id, {
                    status: 'expired',
                });
                throw new common_1.BadRequestException('Invitation code has expired!');
            }
            const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d',
            });
            const { password: _, ...userWithoutPassword } = user;
            return {
                success: true,
                message: 'Sub-member login successful!',
                data: {
                    user: userWithoutPassword,
                    accessToken,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Login completion failed');
        }
    }
    async logout(accessToken) {
        return {
            success: true,
            message: 'Logout successful!',
        };
    }
    async findOne(id) {
        const member = await this.jsonServerService.getUser(id);
        return member;
    }
    async findOneWithEmail(email) {
        try {
            const users = await this.jsonServerService.findOneByField('users', 'email', email);
            if (!users || (Array.isArray(users) && users.length === 0)) {
                throw new common_1.NotFoundException('Invalid Email!');
            }
            const user = Array.isArray(users) ? users[0] : users;
            return { success: true, email: user.email };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async resetPassword({ email, newPassword }) {
        try {
            const users = await this.jsonServerService.findOneByField('users', 'email', email);
            if (!users || users.length === 0)
                throw new common_1.NotFoundException('User not found!');
            const updatedUser = await this.jsonServerService.updateUser(users.id, {
                password: newPassword,
            });
            return { success: true, message: 'Password Reset!',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async updateProfile(userId, updateData) {
        try {
            const user = await this.jsonServerService.getUser(userId);
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            if (updateData.email && updateData.email !== user.email) {
                const existingUsers = await this.jsonServerService.getUsers({
                    email: updateData.email,
                });
                if (existingUsers && existingUsers.length > 0) {
                    throw new common_1.BadRequestException('Email already exists');
                }
            }
            const updatedUser = await this.jsonServerService.updateUser(userId, {
                ...updateData,
                updatedAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        id: updatedUser.id,
                        fullname: updatedUser.fullname,
                        email: updatedUser.email,
                        phone: updatedUser.phone,
                        address: updatedUser.address,
                        profilePicture: updatedUser.profilePicture,
                        roles: updatedUser.roles,
                    },
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to update profile',
                error: error.message,
            };
        }
    }
    async updateProfilePicture(userId, file) {
        try {
            if (!file) {
                const updatedUser = await this.jsonServerService.updateUser(userId, {
                    profilePic: null,
                    updatedAt: new Date().toISOString(),
                });
                return {
                    success: true,
                    message: 'Profile picture removed successfully',
                    data: {
                        user: {
                            id: updatedUser.id,
                            fullname: updatedUser.fullname,
                            profilePic: null,
                        },
                    },
                };
            }
            const image_handler = (0, uploadFileHandler_1.uploadFileHandler)(file.originalname, file);
            if (!image_handler.success) {
                throw new common_1.BadRequestException(image_handler?.message || 'Image upload failed');
            }
            const updatedUser = await this.jsonServerService.updateUser(userId, {
                profilePic: image_handler.data?.filePath,
                updatedAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Profile picture updated successfully',
                data: {
                    user: {
                        id: updatedUser.id,
                        fullname: updatedUser.fullname,
                        profilePic: updatedUser.profilePic,
                    },
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error?.message || 'Failed to update profile picture');
        }
    }
    remove(id) {
        return `This action removes a #${id} auth`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        email_service_1.EmailService,
        json_server_service_1.JsonServerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map