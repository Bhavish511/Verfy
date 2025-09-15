import { CreateFlagChargeDto } from './dto/create-flag-charge.dto';
import { JsonServerService } from '../../services/json-server.service';
export declare class FlagChargeService {
    private readonly jsonServerService;
    constructor(jsonServerService: JsonServerService);
    create({ reasons, comment }: CreateFlagChargeDto, id: string, req: any, uploadedFile?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAll(): string;
}
