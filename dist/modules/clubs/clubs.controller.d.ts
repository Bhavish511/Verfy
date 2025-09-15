import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
export declare class ClubsController {
    private readonly clubsService;
    constructor(clubsService: ClubsService);
    create(createClubDto: CreateClubDto): string;
    findAllforMember(req: any): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    findAllforSubMember(req: any): Promise<{
        success: boolean;
        data: {
            clubs: any;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    findOne(id: string): string;
    choseClubforMember(id: string, req: any): Promise<import("@nestjs/common").BadRequestException | {
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    remove(id: string): string;
}
