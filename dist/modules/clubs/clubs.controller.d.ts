import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
export declare class ClubsController {
    private readonly clubsService;
    constructor(clubsService: ClubsService);
    create(req: any, createClubDto: CreateClubDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAllForMember(req: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    findAllForSubMember(req: any): Promise<{
        success: boolean;
        data: {
            subMemberRelationships: any[];
            clubs: any[];
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            club: any;
            members: any[];
        };
    }>;
    chooseClubForMember(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
