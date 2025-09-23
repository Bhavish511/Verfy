import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('get-dashboard')
  @UseGuards(AuthGuard)
  getDashboard(@Req() req) {
    return this.memberService.getDashboard(req);
  }
  @Get('notifications')
  @UseGuards(AuthGuard)
  getAllNotifications(@Req() req) {
    return this.memberService.getAllNotifications(req);
  }
  @Get('dashboard-view')
  @UseGuards(AuthGuard)
  getDashboardSummary(@Req() req, @Query('period') period: string) {
    console.log('summary!!!');
    return this.memberService.getMemberDashboardSummary(req, period);
  }

  // @Get("dashboard-view")
  // @UseGuards(AuthGuard)
  // getDashboardView(@Req() req, @Query('view') view?: string) {
  //   return this.memberService.getDashboardView(req, view);
  // }
  @Post('switch-club/:clubId')
  @UseGuards(AuthGuard)
  switchClub(@Param('clubId') clubId: string, @Req() req) {
    return this.memberService.switchClub(clubId, req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberService.remove(+id);
  }
}
