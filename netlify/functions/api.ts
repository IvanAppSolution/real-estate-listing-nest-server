import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';
import express, { json, urlencoded } from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (cachedServer) {
    return cachedServer;
  }

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

  // ** THE FIX **
  // Add a custom event source mapping to correctly handle Netlify's event object.
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

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  const response = await cachedServer(event, context);

  if (response) {
    return response;
  }
};