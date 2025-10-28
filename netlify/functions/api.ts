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

  return serverlessExpress({ app: expressApp });
}

// This async/await structure correctly handles the types.
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }

  // Await the handler's response. It could be a HandlerResponse or void.
  const response = await cachedServer(event, context);

  // Explicitly check for a non-void response before returning.
  // If the response is void, the function implicitly returns undefined,
  // which satisfies the `void` part of the Handler's return type.
  if (response) {
    return response;
  }
};