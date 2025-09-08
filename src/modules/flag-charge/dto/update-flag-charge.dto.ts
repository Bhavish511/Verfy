import { PartialType } from '@nestjs/mapped-types';
import { CreateFlagChargeDto } from './create-flag-charge.dto';

export class UpdateFlagChargeDto extends PartialType(CreateFlagChargeDto) {}
