import { CreateFinanceDto } from './dto/create-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { HttpService } from '@nestjs/axios';
import { JsonServerService } from '../../services/json-server.service';
export declare class FinanceService {
    private readonly httpService;
    private readonly jsonServerService;
    constructor(httpService: HttpService, jsonServerService: JsonServerService);
    create(createFinanceDto: CreateFinanceDto): string;
    findExpenses(req: any): Promise<{
        success: boolean;
        data: any;
    }>;
    findOne(id: number): string;
    update(id: number, updateFinanceDto: UpdateFinanceDto): string;
    remove(id: number): string;
}
