import { Controller, Post, Get, UseGuards, Req, Query, Body } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
import { EovService } from './eov.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('eov')
export class EovController {
  constructor(private readonly eovService: EovService) {}

  /**
   * GET /eov/dashboard
   * - Returns dashboard data including total spending, flagged charges, and flagged transactions
   * - Only accessible to members (not sub-members)
   * - Uses JWT user (req.user.id) from AuthGuard
   */
  @UseGuards(AuthGuard)
  @Roles(Role.MEMBER)
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.eovService.getDashboard(req);
  }

  /**
   * POST /eov/export-pdf
   * - Query params: period (daily|weekly|monthly)
   * - Uses JWT user (req.user.id) from AuthGuard
   */
   @UseGuards(AuthGuard)
  @Get('export-pdf')
  async exportPdf(
    @Req() req: any,
    @Query('period') period?: string
  ): Promise<{ success: boolean; link?: string; message?: string }> {
    const userId = String(req.user?.id);
    return this.eovService.fetchAndGenerateReport(userId, period);
  }

  /**
   * POST /eov/send-email
   * - Body: { period?: string, autoSend?: boolean }
   * - Uses JWT user (req.user.id) from AuthGuard
   * - Email will be taken from member's stored profile
   */
  @UseGuards(AuthGuard)
  @Post('send-email')
  async sendEmailReport(
    @Req() req: any,
    @Body() body?: { period?: string; autoSend?: boolean }
  ) {
    const userId = String(req.user?.id);
    return this.eovService.sendEmailReport(userId, body?.period, body?.autoSend);
  }

  /**
   * GET /eov/summary
   * - Query params: period (daily|weekly|monthly)
   * - Returns summary data for the specified period
   */
  @UseGuards(AuthGuard)
  @Get('summary')
  async getSummary(
    @Req() req: any,
    @Query('period') period?: string
  ) {
    const userId = String(req.user?.id);
    return this.eovService.getSummaryReport(userId, period);
  }
}
