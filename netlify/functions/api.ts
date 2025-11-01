import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import serverlessExpress from 'serverless-http';
import express from 'express';

let cachedApp: any;

async function bootstrap() {
  try {
    console.log('=== BOOTSTRAP START ===');
    
    const expressApp = express();
    console.log('=== EXPRESS APP CREATED ===');
    
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn', 'log', 'debug', 'verbose'] }
    );
    console.log('=== NEST APP CREATED ===');

    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    console.log('=== STARTING APP INIT ===');
    await app.init();
    console.log('=== APP INIT COMPLETE ===');

    const handler = serverlessExpress(expressApp);
    console.log('=== SERVERLESS HANDLER CREATED ===');
    
    return handler;
  } catch (error) {
    console.error('=== BOOTSTRAP FATAL ERROR ===');
    console.error('Error name:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    // Try to extract more details
    if (error && typeof error === 'object') {
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    
    // Don't swallow the error
    throw error;
  }
}

export const handler = async (event: any, context: any) => {
  try {
    console.log('=== HANDLER INVOKED ===');
    console.log('Event path:', event.path);
    
    if (!cachedApp) {
      console.log('=== COLD START - BOOTSTRAPPING ===');
      cachedApp = await bootstrap();
      console.log('=== BOOTSTRAP CACHED ===');
    }

    console.log('=== CALLING CACHED APP ===');
    const result = await cachedApp(event, context);
    console.log('=== REQUEST HANDLED SUCCESSFULLY ===');
    
    return result;
  } catch (error) {
    console.error('=== HANDLER ERROR ===');
    console.error('Error name:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error?.message || 'Unknown error',
        details: error?.constructor?.name || 'UnknownError'
      })
    };
  }
};
