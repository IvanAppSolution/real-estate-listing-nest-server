import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import serverless from 'serverless-http';
import express, { json, urlencoded } from 'express';

type NetlifyHandler = (event: HandlerEvent, context: HandlerContext) => Promise<HandlerResponse>;

let cachedServer: NetlifyHandler | null = null;

async function bootstrap(): Promise<NetlifyHandler> {
  // Ensure we use the correct adapter and avoid unnecessary body parsing
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { bodyParser: false }
  );

  // Apply validation pipes and other global configurations
  nestApp.enableCors();
  nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await nestApp.init();

  const handler = serverless(expressApp, {
    basePath: '/.netlify/functions/api',
  }) as unknown as NetlifyHandler;

  return handler;
}

export const handler: NetlifyHandler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  // Use a try/finally block for robust resource cleanup
  try {
    if (!cachedServer) {
      cachedServer = await bootstrap();
    }
    const result = await cachedServer(event, context);
    return result ?? { statusCode: 500, body: JSON.stringify({ message: 'Unknown error' }) };
  } catch (error) {
    console.error('Unhandled error in Netlify function:', error);
    // Return a generic error response for the client
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
  // This can be useful for functions with persistent connections, but use with caution
  // in NestJS/Express apps where connections are managed internally.
  // context.callbackWaitsForEmptyEventLoop = false;
};
