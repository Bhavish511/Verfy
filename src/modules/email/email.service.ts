// email.service.ts

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    subject: string,
    email: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
