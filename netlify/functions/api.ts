import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import serverless from 'serverless-http';
import { Handler } from '@netlify/functions';
import express from 'express';

let cachedServer: any;

async function bootstrapServer(): Promise<any> {
  console.log('Step 1: Creating Express app...');
  const expressApp = express();
  
  console.log('Step 2: Creating NestJS app...');
  const adapter = new ExpressAdapter(expressApp);
  
  const app: INestApplication = await NestFactory.create(
    AppModule,
    adapter,
    { 
      logger: ['error', 'warn', 'log'],
      abortOnError: false
    }
  );

  console.log('Step 3: Configuring NestJS app...');
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  console.log('Step 4: Initializing NestJS app...');
  await app.init();

  console.log('Step 5: Getting HTTP server...');
  // Get the underlying HTTP server from NestJS
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  
  console.log('Step 6: Creating serverless handler...');
  const handler = serverless(instance, {
    binary: ['image/*', 'application/octet-stream']
  });
  
  console.log('Step 7: Bootstrap complete');
  return handler;
}

export const handler: Handler = async (event, context) => {
  try {
    console.log('=== HANDLER CALLED ===');
    console.log('Path:', event.path);
    console.log('Method:', event.httpMethod);
    
    if (!cachedServer) {
      console.log('=== COLD START: Bootstrapping server ===');
      cachedServer = await bootstrapServer();
      console.log('=== Server cached successfully ===');
    }

    console.log('=== Calling cached server ===');
    const result = await cachedServer(event, context);
    console.log('=== Request completed ===');
    return result;
  } catch (error) {
    console.error('=== TOP LEVEL HANDLER ERROR ===');
    console.error('Error name:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server error',
        message: error?.message || 'Unknown error',
      })
    };
  }
};
