import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './modules/member/member.module';
import { SubMemberModule } from './modules/sub-member/sub-member.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { HttpModule } from '@nestjs/axios';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { FlagChargeModule } from './modules/flag-charge/flag-charge.module';
import { EmailModule } from './modules/email/email.module';
import { EovModule } from './modules/eov/eov.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { JsonServerModule } from './modules/json-server/json-server.module';

@Module({
  imports: [
    HttpModule,
    JsonServerModule,
    MemberModule,
    SubMemberModule,
    TransactionsModule,
    AuthModule,
    ClubsModule,
    ExpensesModule,
    FlagChargeModule,
    EmailModule,
    EovModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
