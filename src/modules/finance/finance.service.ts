import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { JsonServerService } from '../../services/json-server.service';

@Injectable()
export class FinanceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jsonServerService: JsonServerService,
  ) {}

  create(createFinanceDto: CreateFinanceDto) {
    return 'This action adds a new finance';
  }

  async findExpenses(req) {
    try {
      const userId = req.user.id;
      const user = await this.jsonServerService.getUser(userId);
      const finance = await this.jsonServerService.getFinance(user.financeId);

      return { success: true, data: finance };
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} finance`;
  }

  update(id: number, updateFinanceDto: UpdateFinanceDto) {
    return `This action updates a #${id} finance`;
  }

  remove(id: number) {
    return `This action removes a #${id} finance`;
  }
}
