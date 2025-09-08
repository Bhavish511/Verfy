import { LoginDto } from './dto/LoginDto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { HttpService } from '@nestjs/axios';
import { EmailService } from '../email/email.service';
import { JsonServerService } from '../../services/json-server.service';
export declare class AuthService {
    private readonly httpService;
    private readonly emailService;
    private readonly jsonServerService;
    constructor(httpService: HttpService, emailService: EmailService, jsonServerService: JsonServerService);
    fields: {
        financeId: null;
        currently_at: null;
        roles: string;
        userId: null;
        transactionId: null;
        dailyExpensesId: null;
    };
    signUp({ email, password, fullname, }: LoginDto & {
        fullname?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: any;
                fullname: any;
                email: any;
                roles: any;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    LoginforMember({ email, password }: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: any;
            accessToken: any;
        };
    }>;
    verifySubMemberCredentials(email: string, password: string): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: string | number;
            email: string;
            role: string;
        };
    }>;
    completeSubMemberLogin(userId: string | number, invitationCode: string): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: string | number;
                email: string;
                roles: string;
                currently_at?: string | number;
            };
            accessToken: any;
        };
    }>;
    logout(accessToken: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: number): Promise<any>;
    findOneWithEmail(email: string): Promise<{
        success: boolean;
        email: any;
    }>;
    resetPassword({ email, newPassword }: UpdateAuthDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProfile(userId: string, updateData: any): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: any;
                fullname: any;
                email: any;
                phone: any;
                address: any;
                profilePicture: any;
                roles: any;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    updateProfilePicture(userId: number, file?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: any;
                fullname: any;
                profilePic: any;
            };
        };
    }>;
    remove(id: number): string;
}
