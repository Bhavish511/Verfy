import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'hubc949@gmail.com',
          pass: process.env.APP_PASSWORD,
        },
      },
      defaults: {
        from: 'hubc949@gmail.com',
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports:[EmailService]
})
export class EmailModule {}
