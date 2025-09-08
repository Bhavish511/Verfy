import { FlagChargeService } from './flag-charge.service';
import { CreateFlagChargeDto } from './dto/create-flag-charge.dto';
export declare class FlagChargeController {
    private readonly flagChargeService;
    constructor(flagChargeService: FlagChargeService);
    create(createFlagChargeDto: CreateFlagChargeDto, id: string, req: any, file?: Express.Multer.File): Promise<{
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
