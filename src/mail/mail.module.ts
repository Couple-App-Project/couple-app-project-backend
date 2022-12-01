import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        // ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.EMAIL_AUTH_USER,
          pass: process.env.EMAIL_AUTH_PASSWORD,
        },
      },
      defaults: {
        from: '"CoupleApp" <no-reply@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    UsersModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
