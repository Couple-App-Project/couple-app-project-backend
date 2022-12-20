import { ConfigModule } from '@nestjs/config';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<MailerOptions> => {
        const host = configService.get('EMAIL_HOST');
        const port = configService.get('EMAIL_PORT');
        const user = configService.get('EMAIL_AUTH_USER');
        const pass = configService.get('EMAIL_AUTH_PASSWORD');
        return {
          transport: {
            host,
            port,
            // ignoreTLS: true,
            secure: false,
            auth: {
              user,
              pass,
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
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
