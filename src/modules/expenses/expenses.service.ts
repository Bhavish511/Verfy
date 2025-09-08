import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JsonServerService } from '../../services/json-server.service';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jsonServerService: JsonServerService,
  ) {}

  create(createExpenseDto: CreateExpenseDto) {
    return 'This action adds a new expense';
  }

  async findAll(req) {
    try {
      const userId = req.user.id;
      const dailyExpenses = await this.jsonServerService.getDailyExpenses({ userId });
      return { success: true, data: dailyExpenses };
    } catch (error) {
      console.log(error.message);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} expense`;
  }

  update(id: number, updateExpenseDto: UpdateExpenseDto) {
    return `This action updates a #${id} expense`;
  }

  remove(id: number) {
    return `This action removes a #${id} expense`;
  }
}
