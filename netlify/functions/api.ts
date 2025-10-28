import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';
import express, { json, urlencoded } from 'express';

// Initialize the server promise outside of the handler
// This ensures bootstrap is only called once when the function is loaded.
const serverPromise = bootstrap();

async function bootstrap(): Promise<Handler> {
  console.log('Bootstrap function starting...');
  const expressApp = express();

  expressApp.use(json({ limit: '10mb' }));
  expressApp.use(urlencoded({ extended: true, limit: '10mb' }));

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { bodyParser: false }
  );

  nestApp.setGlobalPrefix('api');
  nestApp.enableCors();
  nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await nestApp.init();
  console.log('NestJS app initialized.');

  return serverlessExpress({
    app: expressApp,
    eventSource: {
      getRequest: (event: HandlerEvent) => {
        return {
          method: event.httpMethod,
          path: event.path,
          headers: event.headers,
          body: event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
          remoteAddress: event.headers['x-forwarded-for'] || '127.0.0.1',
        };
      },
      getResponse: ({ statusCode, body, headers, isBase64Encoded }) => {
        return {
          statusCode,
          body,
          headers,
          isBase64Encoded,
        };
      },
    },
  });
}

// Fix: Remove the Handler type from the left side and add explicit return type on the right side.
export const handler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  // ** THE DEBUGGING STEP **
  // Log the incoming event to see its structure in Netlify logs.
  console.log('--- Handler Invoked ---');
  console.log('EVENT:', JSON.stringify(event, null, 2));

  try {
    const server = await serverPromise;
    const result = await server(event, context);

    // Ensure we always return a HandlerResponse, never void.
    return result || {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' }),
    };
  } catch (error) {
    console.error('--- Handler Error ---', error);
    // Return a generic error response
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred in the handler.' }),
    };
  }
};