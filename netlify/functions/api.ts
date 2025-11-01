import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express, { Express } from 'express';
import serverlessExpress from '@vendia/serverless-express';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

let cachedHandler: any;

async function bootstrap() {
  try {
    console.log('=== BOOTSTRAP START ===');

    // Create Express instance
    const expressApp: Express = express();

    // Create NestJS app with Express adapter
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: ['error', 'warn', 'log'],
      }
    );

    console.log('=== APP CREATED ===');

    // Configure NestJS
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    console.log('=== INITIALIZING APP ===');
    await app.init();
    console.log('=== APP INITIALIZED ===');

    // Create serverless handler
    const handler = serverlessExpress({ app: expressApp });
    
    console.log('=== BOOTSTRAP COMPLETE ===');

    return handler;
  } catch (error: unknown) {
    console.error('=== BOOTSTRAP FAILED ===');
    
    if (error instanceof Error) {
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    } else {
      console.error('Unknown error:', String(error));
    }
    
    throw error;
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Ensure the handler is created only once (cold start optimization)
    if (!cachedHandler) {
      console.log('=== COLD START ===');
      cachedHandler = await bootstrap();
    }

    // Proxy the request
    const result = await cachedHandler(event, context);
    return result;
  } catch (error: unknown) {
    console.error('=== HANDLER INVOCATION ERROR ===');
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
