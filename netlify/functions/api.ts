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
  
  console.log('Step 1: Creating NestJS app...');
  
  const app: INestApplication = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { 
      logger: console,
      abortOnError: false  // Don't exit the process on error
    }
  ).catch((error) => {
    console.error('FATAL ERROR during NestFactory.create:');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw error;
  });

  console.log('Step 2: NestJS app created successfully');

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  console.log('Step 3: Starting app.init()...');
  
  await app.init().catch((error) => {
    console.error('FATAL ERROR during app.init():');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    throw error;
  });

  console.log('Step 4: app.init() completed successfully');

  const handler = serverlessExpress({ app: expressApp });
  
  console.log('Step 5: Serverless handler created');

  return handler;
}

export const handler: Handler = async (event, context) => {
  try {
    console.log('=== HANDLER CALLED ===');
    console.log('Path:', event.path);
    
    if (!cachedServer) {
      console.log('=== COLD START: Bootstrapping server ===');
      cachedServer = await bootstrapServer();
      console.log('=== Server cached successfully ===');
    }

    console.log('=== Calling cached server ===');
    return await cachedServer(event, context);
  } catch (error) {
    console.error('=== TOP LEVEL HANDLER ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server initialization failed',
        message: error?.message || 'Unknown error',
        type: error?.constructor?.name || 'UnknownError'
      })
    };
  }
};
