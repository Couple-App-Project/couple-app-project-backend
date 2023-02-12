import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { LoggerMiddleware } from './middleware/logger/http-logger.middleware';
import { validate } from './util/validator/env.validation';
import { CalendarsModule } from './calendars/calendars.module';
import { CouplesModule } from './couples/couples.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validate,
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    MailModule,
    CalendarsModule,
    CouplesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
