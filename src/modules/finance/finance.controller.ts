import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  create(@Body() createFinanceDto: CreateFinanceDto) {
    return this.financeService.create(createFinanceDto);
  }

  @Get('/get-expenses')
  @UseGuards(AuthGuard)
  findExpenses(@Req() req) {
    return this.financeService.findExpenses(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinanceDto: UpdateFinanceDto) {
    return this.financeService.update(+id, updateFinanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financeService.remove(+id);
  }
}
