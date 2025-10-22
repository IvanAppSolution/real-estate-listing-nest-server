import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { Handler, HandlerContext, HandlerEvent } from '@netlify/functions';
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

  // Set base path for Netlify functions
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  
  const corsOption = {
    origin: [
      configService.get('FRONTEND_URL') as string,      
      'http://localhost:3000',
      /\.netlify\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
  };

  app.enableCors(corsOption);

  await app.init();

  // Wrap with serverless-http
  cachedApp = serverless(expressApp, {
    binary: ['image/*', 'application/pdf'],
  });

  console.log('✅ NestJS app initialized for serverless');

  return cachedApp;
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Prevent Lambda from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const app = await bootstrapServer();
    return await app(event, context);
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
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};