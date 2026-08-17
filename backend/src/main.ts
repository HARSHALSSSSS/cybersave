import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { mountAdminSpa } from './spa/admin-spa';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 8000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', []);
  const swaggerEnabled = configService.get<boolean>('app.swaggerEnabled', true);

  app.setGlobalPrefix(apiPrefix);
  mountAdminSpa(app);
  app.use(helmet({ contentSecurityPolicy: false }));
  const allowAllCors =
    corsOrigins.length === 0 ||
    corsOrigins.includes('*') ||
    corsOrigins.includes('true');
  app.enableCors({
    origin: allowAllCors ? true : corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Cybersave API')
      .setDescription('Digital services platform API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'citizen-auth',
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'admin-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  // Bind 0.0.0.0 so Railway / Docker can reach the process from outside the container.
  await app.listen(port, '0.0.0.0');
  console.log(`Cybersave API running on http://0.0.0.0:${port}/${apiPrefix}`);
  if (swaggerEnabled) {
    console.log(`Swagger docs: http://0.0.0.0:${port}/${apiPrefix}/docs`);
  }
}

bootstrap();
