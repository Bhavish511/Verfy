import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSubMemberDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsBoolean()
  @IsOptional()
  under12: boolean;
  @IsString()
  @IsNotEmpty()
  relation: string;
  @IsNumber()
  @IsNotEmpty()
  allowance: number;
  @IsString()
  @IsNotEmpty()
  BillingCycle: string;
}

// fields = {
//     fullname: null,
//     email: null,
//     under12: null,
//     relation: null,
//     allowance: null,
//     totalSpent: null,
//     BillingCycle: null,
//   };
