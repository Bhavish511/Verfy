import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { HttpModule } from '@nestjs/axios';
import { JsonServerModule } from '../json-server/json-server.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[HttpModule,AuthModule,JsonServerModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
