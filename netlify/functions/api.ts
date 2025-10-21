import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { Handler } from '@netlify/functions';
import serverless from 'serverless-http';

let cachedApp: any;

async function bootstrapServer() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn', 'log'] }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set base path for Netlify functions
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  
  const corsOption = {
    origin: [
      configService.get('FRONTEND_URL') as string,      
      'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
  };

  app.enableCors(corsOption);

  await app.init();

  cachedApp = serverless(expressApp);
  return cachedApp;
}

export const handler: Handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  const app = await bootstrapServer();
  return app(event, context);
};