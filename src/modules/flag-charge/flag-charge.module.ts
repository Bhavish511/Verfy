import { Module } from '@nestjs/common';
import { FlagChargeService } from './flag-charge.service';
import { FlagChargeController } from './flag-charge.controller';
import { HttpModule } from '@nestjs/axios';
import { JsonServerModule } from '../json-server/json-server.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[HttpModule,AuthModule,JsonServerModule],
  controllers: [FlagChargeController],
  providers: [FlagChargeService],
})
export class FlagChargeModule {}
