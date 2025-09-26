import { JsonServerService } from '../../services/json-server.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
export declare class ClubsService {
    private readonly jsonServerService;
    constructor(jsonServerService: JsonServerService);
    createClub(userId: string, createClubDto: CreateClubDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAllForMember(userId: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    findAllForSubMember(userId: string): Promise<{
        success: boolean;
        data: {
            subMemberRelationships: any[];
            clubs: any[];
        };
    }>;
    chooseClubForMember(userId: string, clubId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    updateClub(clubId: string, updateClubDto: UpdateClubDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    removeClub(clubId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getClubDetails(clubId: string): Promise<{
        success: boolean;
        data: {
            club: any;
            members: any[];
        };
    }>;
    private removeDuplicates;
}
