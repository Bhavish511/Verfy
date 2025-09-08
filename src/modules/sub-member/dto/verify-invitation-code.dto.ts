import { IsString } from 'class-validator';

export class VerifyInvitationCodeDto {
  @IsString()
  invitationCode!: string;
}
