import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JsonServerService } from '../../services/json-server.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

type Club = {
  id: string;
  userId: string | number;
  name: string;
  location?: string; // Added to match JsonServerService validation
  currently_at?: number | string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ClubsService {
  constructor(private readonly jsonServerService: JsonServerService) {}

  async createClub(userId: string, createClubDto: CreateClubDto) {
    try {
      // JsonServerService expects 'name' and 'location' for clubs
      const clubData = {
        name: createClubDto.name,
        location: createClubDto.location || '', // Required field
        userId: userId, // Custom field for your logic
        currently_at: createClubDto.currently_at || 0,
      };

      const club = await this.jsonServerService.createClub(clubData);

      return {
        success: true,
        message: 'Club created successfully',
        data: club,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create club: ' + error.message);
    }
  }

  async findAllForMember(userId: string) {
    try {
      // Use the correct method - find clubs by userId in club data or user_clubs relation
      const allClubs = await this.jsonServerService.getClubs();
      
      // Filter clubs that belong to this user or where user is a member
      const userClubs = allClubs.filter(club => 
        club.userId === userId || 
        club.userId?.toString() === userId.toString()
      );

      // Also get clubs from user_clubs relationship
      const userClubRelations = await this.jsonServerService.getUserClubs({ userId: userId });
      const relationClubIds = userClubRelations.map(rel => rel.clubId);
      
      const relationClubs = allClubs.filter(club => 
        relationClubIds.includes(club.id) || 
        relationClubIds.includes(club.id.toString())
      );

      const allUserClubs = [...userClubs, ...relationClubs];
      const uniqueClubs = this.removeDuplicates(allUserClubs, 'id');

      return { success: true, data: uniqueClubs };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch clubs for member: ' + error.message);
    }
  }

  async findAllForSubMember(userId: string) {
    try {
      // Get user_clubs where this user is a sub-member (memberId matches)
      const subMemberClubs = await this.jsonServerService.getClubsForParentMember(userId);
      
      // Get the actual club details for these relationships
      const clubIds = subMemberClubs.map(rel => rel.clubId);
      const allClubs = await this.jsonServerService.getClubs();
      const clubs = allClubs.filter(club => 
        clubIds.includes(club.id) || clubIds.includes(club.id.toString())
      );

      return { 
        success: true, 
        data: { 
          subMemberRelationships: subMemberClubs, 
          clubs: clubs 
        } 
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch sub-member clubs: ' + error.message);
    }
  }

  async chooseClubForMember(userId: string, clubId: string) {
    try {
      // Verify club exists
      const club = await this.jsonServerService.getClub(clubId);
      
      if (!club) {
        throw new NotFoundException('Club not found');
      }

      // Verify user has access to this club
      const userClubs = await this.jsonServerService.getUserClubs({ 
        userId: userId, 
        clubId: clubId 
      });
      
      const allClubs = await this.jsonServerService.getClubs();
      const directClubAccess = allClubs.find(c => 
        c.id === clubId && c.userId === userId
      );

      if (userClubs.length === 0 && !directClubAccess) {
        throw new BadRequestException('User does not have access to this club');
      }

      // Update user's current club
      const updatedUser = await this.jsonServerService.updateUser(userId, {
        currently_at: clubId,
      });

      return { 
        success: true, 
        message: `Club ${club.name} selected successfully`,
        data: updatedUser 
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to choose club for member: ' + error.message);
    }
  }

  async updateClub(clubId: string, updateClubDto: UpdateClubDto) {
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
    } catch (error) {
      throw new InternalServerErrorException('Failed to update club: ' + error.message);
    }
  }

  async removeClub(clubId: string) {
    try {
      // First, delete any user_clubs relationships
      const userClubs = await this.jsonServerService.getUserClubs({ clubId: clubId });
      
      for (const relation of userClubs) {
        await this.jsonServerService.deleteUserClub(relation.id);
      }

      // Then delete the club
      await this.jsonServerService.deleteClub(clubId);
      
      return { 
        success: true, 
        message: `Club ${clubId} and its relationships removed successfully` 
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove club: ' + error.message);
    }
  }

  async getClubDetails(clubId: string) {
    try {
      const club = await this.jsonServerService.getClub(clubId);
      
      if (!club) {
        throw new NotFoundException('Club not found');
      }

      // Get club members from user_clubs
      const clubMembers = await this.jsonServerService.getUserClubs({ clubId: clubId });
      
      return {
        success: true,
        data: {
          club,
          members: clubMembers,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch club details: ' + error.message);
    }
  }

  // Helper method to remove duplicates from array
  private removeDuplicates(array: any[], key: string): any[] {
    return array.filter((item, index, self) => 
      index === self.findIndex(t => t[key] === item[key])
    );
  }
}