import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';
import express, { json, urlencoded } from 'express';

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
        // ** THE FIX **
        // The path from Netlify includes the function path, which we need to remove.
        // Example: "/.netlify/functions/api/health" -> "/health"
        // Since your global prefix is 'api', the final path passed to NestJS will be correct.
        const path = event.path.replace('/.netlify/functions/api', '');

        return {
          method: event.httpMethod,
          path: path || '/', // Ensure path is at least "/"
          headers: event.headers,
          body: event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64') : event.body,
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

export const handler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  console.log('--- Handler Invoked ---');
  console.log('EVENT:', JSON.stringify(event, null, 2));

  try {
    const server = await serverPromise;
    const result = await server(event, context);

    return result || {
      statusCode: 404, // If no route is found, it's a 404
      body: JSON.stringify({ message: 'Not Found' }),
    };
  } catch (error) {
    console.error('--- Handler Error ---', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred in the handler.' }),
    };
  }
};