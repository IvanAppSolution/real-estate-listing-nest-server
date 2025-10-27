import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: any;

async function bootstrapServer() {
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
        : ['error', 'warn', 'log', 'debug']
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
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
  };

  app.enableCors(corsOption);

  await app.init();

  console.log('✅ NestJS app initialized for serverless');

  // Use serverless-express
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
    return await server(event, context);
  } catch (error) {
    console.error('❌ Serverless handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }),
    };
  }
};