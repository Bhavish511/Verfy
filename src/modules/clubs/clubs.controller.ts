import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req, @Body() createClubDto: CreateClubDto) {
    const userId = req.user?.id || req.user?.userId;
    return this.clubsService.createClub(userId, createClubDto);
  }

  @Get('club-member/get-clubs')
  @UseGuards(AuthGuard)
  findAllForMember(@Req() req) {
    const userId = req.user?.id || req.user?.userId;
    return this.clubsService.findAllForMember(userId);
  }

  @Get('club-sub-member/get-clubs')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  findAllForSubMember(@Req() req) {
    const userId = req.user?.id || req.user?.userId;
    return this.clubsService.findAllForSubMember(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.getClubDetails(id);
  }

  @Patch('choose-club/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER, Role.MEMBER)
  chooseClubForMember(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id || req.user?.userId;
    return this.clubsService.chooseClubForMember(userId, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.clubsService.removeClub(id);
  }
}