import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FlagChargeService } from './flag-charge.service';
import { CreateFlagChargeDto } from './dto/create-flag-charge.dto';
import { UpdateFlagChargeDto } from './dto/update-flag-charge.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('flag-charge')
export class FlagChargeController {
  constructor(private readonly flagChargeService: FlagChargeService) {}

  @Post(':transactionId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createFlagChargeDto: CreateFlagChargeDto,
    @Param('transactionId') id: string,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.flagChargeService.create(createFlagChargeDto,id, req, file);
  }

  @Get()
  findAll() {
    return this.flagChargeService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.flagChargeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFlagChargeDto: UpdateFlagChargeDto) {
  //   return this.flagChargeService.update(+id, updateFlagChargeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.flagChargeService.remove(+id);
  // }
}
