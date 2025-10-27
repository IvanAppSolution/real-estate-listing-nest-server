import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer: any;

async function bootstrapServer() {
  if (cachedServer) {
    return cachedServer;
  }

  try {
    // Create Express app first
    const expressApp = express();

    // Create NestJS app with Express adapter
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: process.env.NODE_ENV === 'production' 
          ? ['error', 'warn'] 
          : ['error', 'warn', 'log'],
        abortOnError: false,
      }
    );

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    // CORS configuration
    const configService = app.get(ConfigService);
    
    app.enableCors({
      origin: [
        configService.get('FRONTEND_URL') || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:8888',
        /\.netlify\.app$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    });

    // Initialize NestJS app
    await app.init();

    console.log('✅ NestJS app initialized for serverless');

    // Wrap with serverless-express
    cachedServer = serverlessExpress({ 
      app: expressApp,
      binaryMimeTypes: [
        'application/octet-stream',
        'image/*',
        'multipart/form-data',
      ]
    });

    return cachedServer;

  } catch (error) {
    console.error('❌ Failed to bootstrap server:', error);
    throw error;
  }
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Prevent Lambda from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const server = await bootstrapServer();
    
    // Call the serverless handler with event and context
    return await server(event, context);
    
  } catch (error) {
    console.error('❌ Handler error:', error);
    
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
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