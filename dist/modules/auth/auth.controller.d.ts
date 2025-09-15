import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgetPasswordDto } from './dto/forgetpassword.dto';
import { CompleteLoginDto } from './dto/CompleteLogin.dto';
import { VerifyCredentialsDto } from './dto/submember-credentials.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(loginDto: LoginDto): Promise<{
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
    Login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            user: any;
            accessToken: any;
        };
    }>;
    verifySubMemberCredentials(verifyCredentialsDto: VerifyCredentialsDto): Promise<{
        success: boolean;
        message: string;
        skipInvitation: boolean;
        data: {
            user: {
                id: string | number;
                email: string;
                memberId?: string;
                roles: string;
                currently_at?: string | number;
            };
            accessToken: any;
            userId?: undefined;
            email?: undefined;
            role?: undefined;
        };
    } | {
        success: boolean;
        message: string;
        skipInvitation: boolean;
        data: {
            userId: string | number;
            email: string;
            role: string;
            user?: undefined;
            accessToken?: undefined;
        };
    }>;
    completeSubMemberLogin(completeLoginDto: CompleteLoginDto): Promise<{
        success: boolean;
        message: string;
        skipInvitation: boolean;
        data: {
            user: {
                memberName: any;
                id: string | number;
                email: string;
                memberId?: string;
                roles: string;
                currently_at?: string | number;
            };
            accessToken: any;
        };
    }>;
    findOneWithEmail(body: ForgetPasswordDto): Promise<{
        success: boolean;
        email: any;
    }>;
    update(updateAuthDto: UpdateAuthDto): Promise<{
        success: boolean;
        message: string;
    }>;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
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
    updateProfilePicture(req: any, file: Express.Multer.File): Promise<{
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
    remove(id: string): string;
}
