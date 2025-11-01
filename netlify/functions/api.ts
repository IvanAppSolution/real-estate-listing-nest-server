import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from 'serverless-http';
import express from 'express';

let cachedApp: any;

async function bootstrap() {
  const expressApp = express();
  
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();

  return serverlessExpress(expressApp);
}

export const handler = async (event: any, context: any) => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }

  return cachedApp(event, context);
};
