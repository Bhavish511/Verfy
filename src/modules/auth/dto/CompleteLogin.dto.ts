import { IsNotEmpty,IsString } from "class-validator";
import { Type } from 'class-transformer';

export class CompleteLoginDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @Type(() => String)
  userId: string | number;

  @IsString({ message: 'Invitation code must be a string' })
  @IsNotEmpty({ message: 'Invitation code is required' })
  invitationCode: string;
}