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
const json_server_service_1 = require("../../services/json-server.service");
let ClubsService = class ClubsService {
    jsonServerService;
    constructor(jsonServerService) {
        this.jsonServerService = jsonServerService;
    }
    async createClub(userId, createClubDto) {
        try {
            const clubData = {
                name: createClubDto.name,
                location: createClubDto.location || '',
                userId: userId,
                currently_at: createClubDto.currently_at || 0,
            };
            const club = await this.jsonServerService.createClub(clubData);
            return {
                success: true,
                message: 'Club created successfully',
                data: club,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to create club: ' + error.message);
        }
    }
    async findAllForMember(userId) {
        try {
            const allClubs = await this.jsonServerService.getClubs();
            const userClubs = allClubs.filter(club => club.userId === userId ||
                club.userId?.toString() === userId.toString());
            const userClubRelations = await this.jsonServerService.getUserClubs({ userId: userId });
            const relationClubIds = userClubRelations.map(rel => rel.clubId);
            const relationClubs = allClubs.filter(club => relationClubIds.includes(club.id) ||
                relationClubIds.includes(club.id.toString()));
            const allUserClubs = [...userClubs, ...relationClubs];
            const uniqueClubs = this.removeDuplicates(allUserClubs, 'id');
            return { success: true, data: uniqueClubs };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch clubs for member: ' + error.message);
        }
    }
    async findAllForSubMember(userId) {
        try {
            const subMemberClubs = await this.jsonServerService.getClubsForParentMember(userId);
            const clubIds = subMemberClubs.map(rel => rel.clubId);
            const allClubs = await this.jsonServerService.getClubs();
            const clubs = allClubs.filter(club => clubIds.includes(club.id) || clubIds.includes(club.id.toString()));
            return {
                success: true,
                data: {
                    subMemberRelationships: subMemberClubs,
                    clubs: clubs
                }
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to fetch sub-member clubs: ' + error.message);
        }
    }
    async chooseClubForMember(userId, clubId) {
        try {
            const club = await this.jsonServerService.getClub(clubId);
            if (!club) {
                throw new common_1.NotFoundException('Club not found');
            }
            const userClubs = await this.jsonServerService.getUserClubs({
                userId: userId,
                clubId: clubId
            });
            const allClubs = await this.jsonServerService.getClubs();
            const directClubAccess = allClubs.find(c => c.id === clubId && c.userId === userId);
            if (userClubs.length === 0 && !directClubAccess) {
                throw new common_1.BadRequestException('User does not have access to this club');
            }
            const updatedUser = await this.jsonServerService.updateUser(userId, {
                currently_at: clubId,
            });
            return {
                success: true,
                message: `Club ${club.name} selected successfully`,
                data: updatedUser
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to choose club for member: ' + error.message);
        }
    }
    async updateClub(clubId, updateClubDto) {
        try {
            const updatedClub = await this.jsonServerService.updateClub(clubId, {
                ...updateClubDto,
                updatedAt: new Date().toISOString(),
            });
            return {
                success: true,
                message: 'Club updated successfully',
                data: updatedClub,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to update club: ' + error.message);
        }
    }
    async removeClub(clubId) {
        try {
            const userClubs = await this.jsonServerService.getUserClubs({ clubId: clubId });
            for (const relation of userClubs) {
                await this.jsonServerService.deleteUserClub(relation.id);
            }
            await this.jsonServerService.deleteClub(clubId);
            return {
                success: true,
                message: `Club ${clubId} and its relationships removed successfully`
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to remove club: ' + error.message);
        }
    }
    async getClubDetails(clubId) {
        try {
            const club = await this.jsonServerService.getClub(clubId);
            if (!club) {
                throw new common_1.NotFoundException('Club not found');
            }
            const clubMembers = await this.jsonServerService.getUserClubs({ clubId: clubId });
            return {
                success: true,
                data: {
                    club,
                    members: clubMembers,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch club details: ' + error.message);
        }
    }
    removeDuplicates(array, key) {
        return array.filter((item, index, self) => index === self.findIndex(t => t[key] === item[key]));
    }
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_server_service_1.JsonServerService])
], ClubsService);
//# sourceMappingURL=clubs.service.js.map