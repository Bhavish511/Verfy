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
exports.ClubsService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
let ClubsService = class ClubsService {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    create(createClubDto) {
        return 'This action adds a new club';
    }
    async findAllforMember(req) {
        try {
            const userId = req.user.id;
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://localhost:3001/clubs?userId=${userId}`));
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async findAllforSubMember(req) {
        try {
            const userId = req.user.id;
            const { data: subMember } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://localhost:3001/users?parentId=${userId}`));
            const { data: clubs } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://localhost:3001/user_clubs?userId=${userId}`));
            return { success: true, data: { clubs } };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    findOne(id) {
        return `This action returns a #${id} club`;
    }
    async choseClubforMember(id, req) {
        try {
            const userId = req.user.id;
            const { data: club } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://localhost:3001/clubs?userId=${userId}`));
            if (!club)
                return new common_1.BadRequestException('Club not Found!');
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`http://localhost:3001/users/${userId}`, {
                currently_at: id,
            }));
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    remove(id) {
        return `This action removes a #${id} club`;
    }
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], ClubsService);
//# sourceMappingURL=clubs.service.js.map