import { PartialType } from '@nestjs/mapped-types';
import { CreateEovDto } from './create-eov.dto';

export class UpdateEovDto extends PartialType(CreateEovDto) {}
