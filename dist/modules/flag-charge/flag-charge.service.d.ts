import { CreateFlagChargeDto } from './dto/create-flag-charge.dto';
import { HttpService } from '@nestjs/axios';
import { JsonServerService } from '../../services/json-server.service';
export declare class FlagChargeService {
    private readonly httpService;
    private readonly jsonServerService;
    constructor(httpService: HttpService, jsonServerService: JsonServerService);
    create({ reasons, comment, file }: CreateFlagChargeDto, id: string, req: any, uploadedFile?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data: null;
        error: any;
    }>;
    findAll(): string;
}
