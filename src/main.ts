import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeApp } from 'firebase-admin/app';
import * as admin from 'firebase-admin';
import { LogLevel, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logLevels: LogLevel[] = process.env.LOG_LEVEL.split(',') as LogLevel[];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  await app.listen(3000);
}
bootstrap();
