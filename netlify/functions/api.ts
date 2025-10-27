import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';

const express = require('express');

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
    }
  );

  nestApp.setGlobalPrefix('api');
  
  const configService = nestApp.get(ConfigService);
  nestApp.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        configService.get('FRONTEND_URL'),
        'http://localhost:3000',
        'http://localhost:8888',
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin) || /\.netlify\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // IMPORTANT: app.init() IS required for the app to be ready.
  await nestApp.init();

  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
) => {
  // This pattern ensures bootstrap is only called once.
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  
  // Pass the event and context to the cached server handler.
  return cachedServer(event, context);
};