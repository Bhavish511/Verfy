import { IsArray, IsOptional, IsString } from "class-validator";

export class CreateFlagChargeDto {
    @IsOptional()
    @IsArray()
    reasons:string[]
    @IsOptional()
    @IsString()
    comment:string
    @IsOptional()
    @IsString()
    file?: string  // File path will be stored here after upload
}
