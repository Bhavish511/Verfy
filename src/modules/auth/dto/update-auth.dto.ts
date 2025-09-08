import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class UpdateAuthDto {
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    email:string

    @IsNotEmpty()
    @IsString()
    newPassword:string
}
