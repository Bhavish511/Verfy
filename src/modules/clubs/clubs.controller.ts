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
  create(@Body() createClubDto: CreateClubDto) {
    return this.clubsService.create(createClubDto);
  }

  @Get('club-member/get-clubs')
  @UseGuards(AuthGuard)
  // @Roles(Role.MEMBER)
  findAllforMember(@Req() req) {
    return this.clubsService.findAllforMember(req);
  }
  @Get('club-sub-member/get-clubs')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  findAllforSubMember(@Req() req) {
    return this.clubsService.findAllforSubMember(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  choseClubforMember(@Param('id') id: string,@Req()req) {
    return this.clubsService.choseClubforMember(+id, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clubsService.remove(+id);
  }
}
