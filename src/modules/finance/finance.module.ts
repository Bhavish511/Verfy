import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { HttpModule } from '@nestjs/axios';
import { JsonServerModule } from '../json-server/json-server.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule,HttpModule,JsonServerModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports:[FinanceService]
})
export class FinanceModule {}
