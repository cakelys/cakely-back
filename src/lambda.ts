import { configure as serverlessExpress } from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedServer;

export const handler = async (event, context) => {
  if (!cachedServer) {
    console.log(event);
    const nestApp = await NestFactory.create(AppModule);
    nestApp.enableCors();

    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
