import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('transaction')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('create-transaction/:clubId')
  @UseGuards(AuthGuard)
  create(
    @Body() dto: CreateTransactionDto,
    @Param('clubId') id: string,
    @Req() req,
  ) {
    return this.transactionsService.create(dto, +id, req);
  }

  @Get('get-transactions-for-sub-member')
  @UseGuards(AuthGuard)
  @Roles(Role.SUBMEMBER)
  findAllForSubMember(@Req() req) {
    return this.transactionsService.findAllForSubMember(req);
  }

  @Get('get-transactions-for-member')
  @UseGuards(AuthGuard)
  @Roles(Role.MEMBER)
  findAllForMember(@Req() req) {
    return this.transactionsService.findAllForMember(req);
  }

  @Get('transaction-feed')
  @UseGuards(AuthGuard)
  getTransactionFeed(
    @Req() req,
    @Query('status') status?: string,
    @Query('category') categoryRaw?: string | string[],
    @Query('subMemberId') subMemberId?: string,
    @Query('dateRange') dateRange?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    // ✅ Normalize category
  const category =
    Array.isArray(categoryRaw)
      ? categoryRaw
      : categoryRaw
        ? categoryRaw.split(',').map((c) => c.trim()).filter(Boolean)
        : [];

    const filters = {
      status,
      category,
      subMemberId,
      dateRange,
      fromDate,
      toDate,
    };
    return this.transactionsService.getfilertedTransactionFeed(req, filters);
  }
  @Get('categories')
  @UseGuards(AuthGuard)
  async getCategories(@Req() req: any) {
    return this.transactionsService.getCategories(req);
  }

  @Patch('verify-charge/:id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Req() req) {
    return this.transactionsService.verifyCharge(id, req);
  }
}
