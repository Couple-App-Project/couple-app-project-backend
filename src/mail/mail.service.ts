import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendCodeToNewUser(email: string, code: string): Promise<boolean> {
    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증 요청',
      template: 'check-email.ejs',
      context: { emailCode: code },
    });

    return true;
  }
}
