import { PartialType } from '@nestjs/mapped-types';
import { CreateSubMemberDto } from './create-sub-member.dto';

export class UpdateSubMemberDto extends PartialType(CreateSubMemberDto) {}
