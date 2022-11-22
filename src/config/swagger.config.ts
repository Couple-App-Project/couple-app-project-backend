import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_CONFIG = new DocumentBuilder()
  .setTitle('couple-app-APIs')
  .setDescription('APIs for couple App')
  .setVersion('1.0')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT2',
    description: 'Enter JWT token',
    in: 'header',
  })
  .build();
