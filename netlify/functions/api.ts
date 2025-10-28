import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import serverless from 'serverless-http';
import express, { json, urlencoded } from 'express';

// Define a precise Netlify handler type
type NetlifyHandler = (event: HandlerEvent, context: HandlerContext) => Promise<HandlerResponse>;

let cachedServer: NetlifyHandler | null = null;

async function bootstrap(): Promise<NetlifyHandler> {
  const expressApp = express();

  expressApp.use(json({ limit: '10mb' }));
  expressApp.use(urlencoded({ extended: true, limit: '10mb' }));

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { bodyParser: false }
  );

  // No global prefix; basePath will strip Netlify’s prefix
  nestApp.enableCors();
  nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await nestApp.init();

  // Cast serverless-http wrapper to our NetlifyHandler type
  const handler = serverless(expressApp, {
    basePath: '/.netlify/functions/api',
  }) as unknown as NetlifyHandler;

  return handler;
}

export const handler: NetlifyHandler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  const result = await cachedServer(event, context);

  // Ensure a valid HandlerResponse is always returned
  return result ?? { statusCode: 500, body: JSON.stringify({ message: 'Unknown error' }) };
};