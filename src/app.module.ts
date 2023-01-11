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
import { CouplesController } from './couples/couples.controller';
import { CalendarsModule } from './calendars/calendars.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate,
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    MailModule,
    CalendarsModule,
  ],
  controllers: [AppController, CouplesController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
