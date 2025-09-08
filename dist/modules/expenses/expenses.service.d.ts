import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { HttpService } from '@nestjs/axios';
import { JsonServerService } from '../../services/json-server.service';
export declare class ExpensesService {
    private readonly httpService;
    private readonly jsonServerService;
    constructor(httpService: HttpService, jsonServerService: JsonServerService);
    create(createExpenseDto: CreateExpenseDto): string;
    findAll(req: any): Promise<{
        success: boolean;
        data: any[];
    } | undefined>;
    findOne(id: number): string;
    update(id: number, updateExpenseDto: UpdateExpenseDto): string;
    remove(id: number): string;
}
