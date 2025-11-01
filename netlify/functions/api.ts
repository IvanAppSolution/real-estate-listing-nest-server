import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import serverlessExpress from '@codegenie/serverless-express';
import { Handler } from '@netlify/functions';
import express, { Express } from 'express';

let cachedServer: any;

async function bootstrapServer(): Promise<any> {
  const expressApp: Express = express();
  
  const app: INestApplication = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn', 'log'] }
  );

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();

  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }

  return cachedServer(event, context);
};
