import { BadRequestException } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { HttpService } from '@nestjs/axios';
export declare class ClubsService {
    private readonly httpService;
    constructor(httpService: HttpService);
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
    findOne(id: number): string;
    choseClubforMember(id: number, req: any): Promise<BadRequestException | {
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    remove(id: number): string;
}
