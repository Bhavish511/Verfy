import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { JsonServerModule } from '../json-server/json-server.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[TransactionsModule,AuthModule,JsonServerModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
