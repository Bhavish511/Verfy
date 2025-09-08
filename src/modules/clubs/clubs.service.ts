import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { firstValueFrom, NotFoundError } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ClubsService {
  constructor(private readonly httpService: HttpService) {}

  create(createClubDto: CreateClubDto) {
    return 'This action adds a new club';
  }

  async findAllforMember(req) {
    try {
      const userId = req.user.id;
      const { data } = await firstValueFrom(
        this.httpService.get(`http://localhost:3001/clubs?userId=${userId}`),
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async findAllforSubMember(req) {
    try {
      const userId = req.user.id;
      const { data: subMember } = await firstValueFrom(
        this.httpService.get(`http://localhost:3001/users?parentId=${userId}`),
      );
      const { data: clubs } = await firstValueFrom(
        this.httpService.get(`http://localhost:3001/user_clubs?userId=${userId}`),
      );
      return { success: true, data: { clubs } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} club`;
  }

  async choseClubforMember(id: number, req) {
    try {
      const userId = req.user.id;
      const { data: club } = await firstValueFrom(
        this.httpService.get(`http://localhost:3001/clubs?userId=${userId}`),
      );
      if (!club) return new BadRequestException('Club not Found!');
      const { data } = await firstValueFrom(
        this.httpService.patch(`http://localhost:3001/users/${userId}`, {
          currently_at: id,
        }),
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} club`;
  }
}
