import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { SubMemberService } from './sub-member.service';
import { UpdateSubMemberDto } from './dto/update-sub-member.dto';
import { CreateSubMemberDto } from './dto/create-sub-member.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import {VerifyInvitationCodeDto} from './dto/verify-invitation-code.dto'

@Controller('submember')
export class SubMemberController {
  constructor(private readonly subMemberService: SubMemberService) {}
 
  
  @Post('register')
  @UseGuards(AuthGuard)
  @Roles(Role.MEMBER)
  createSubMember(@Body() createSubMemberDto:CreateSubMemberDto,@Req() req) {
    return this.subMemberService.createSubMember(createSubMemberDto,req);
  }
  @Get('notifications')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  getAllNotifications(@Req() req){
    return this.subMemberService.getAllNotifications(req);
  }
  @Post('remove-sub-member/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.MEMBER)
  removeSubMember(@Param('id') id: string) {
    return this.subMemberService.removeSubMember(id);
  }
  
  @Post('edit-allowance/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.MEMBER)
  editAllowance(@Param('id') id: string, @Body() body: { allowance: number }, @Req() req) {
    return this.subMemberService.editAllowance(req,id, body.allowance);
  }
  @Get('get-subdashboard/:id')
  @UseGuards(AuthGuard)
  getsubDashboard(@Param('id') id:string) {
    return this.subMemberService.getsubDashboard(id);
  }

  @Get('get-dashboard')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  getDashboard(@Req() req) {
    return this.subMemberService.getDashboard(req);
  }
  

  @Get('dashboard-view')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  getDashboardView(@Req() req, @Query('view') view: string) {
    return this.subMemberService.getSubMemberDashboardSummary(req, view);
  }

  @Get('get-all')
  @UseGuards(AuthGuard)
  @Roles(Role.MEMBER)
  findAllSubMembers(@Req() req) {
    return this.subMemberService.getAllSubMembers(req);
  }

  @Post("switch-club/:clubId")
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  switchClub(@Param('clubId') clubId: string, @Req() req) {
    return this.subMemberService.switchClub(clubId, req);
  }

  @Post('validate-invitation-code')
  validateInvitationCode(@Body() body: { invitationCode: string }) {    
    return this.subMemberService.validateInvitationCode(body.invitationCode);
  }
}
