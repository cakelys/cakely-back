import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { LogLevel, ValidationPipe, VersioningType } from '@nestjs/common';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    // dev version log
    console.log(event);

    const logLevels: LogLevel[] = process.env.LOG_LEVEL.split(
      ',',
    ) as LogLevel[];

    const nestApp = await NestFactory.create(AppModule, {
      logger: logLevels,
    });

    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    nestApp.enableVersioning({
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

    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
