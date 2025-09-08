import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { HttpModule } from '@nestjs/axios';
import { JsonServerModule } from '../json-server/json-server.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[HttpModule,AuthModule,JsonServerModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
