import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: Handler;

async function bootstrapServer(): Promise<Handler> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: process.env.NODE_ENV === 'production' 
        ? ['error', 'warn'] 
        : ['error', 'warn', 'log', 'debug'],
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  const corsOption = {
    origin: [
      configService.get('FRONTEND_URL') || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:8888',
      /\.netlify\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  };

  app.enableCors(corsOption);

  await app.init();

  console.log('✅ NestJS app initialized');

  cachedServer = serverlessExpress({ app: expressApp });

  return cachedServer;
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const server = await bootstrapServer();
    const response = await server(event, context);
    return response || {
      statusCode: 200,
      body: '',
    };
  } catch (error) {
    console.error('❌ Handler error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : undefined,
      }),
    };
  }
};