import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTransactionDto {
    @IsNotEmpty()
    @IsNumber()
    bill:number
    @IsNotEmpty()
    @IsString()
    category:string
}