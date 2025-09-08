import { Module } from '@nestjs/common';
import { SubMemberService } from './sub-member.service';
import { SubMemberController } from './sub-member.controller';
import { HttpModule } from '@nestjs/axios';
import { JsonServerModule } from '../json-server/json-server.module';
import { AuthModule } from '../auth/auth.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports:[HttpModule.register({ timeout: 8000 }),AuthModule,JsonServerModule,TransactionsModule],
  controllers: [SubMemberController],
  providers: [SubMemberService],
  exports:[SubMemberService]
})
export class SubMemberModule {}