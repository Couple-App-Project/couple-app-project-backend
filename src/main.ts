import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SWAGGER_CONFIG } from './config/swagger.config';
import { SuccessInterceptor } from './interceptors/success.interceptor';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const document = SwaggerModule.createDocument(app, SWAGGER_CONFIG);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors();
  app.use(cookieParser());
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  await app.listen(configService.get('PORT'));
}
bootstrap();
