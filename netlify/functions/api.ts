import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  if (cachedServer) {
    return cachedServer;
  }

  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  nestApp.setGlobalPrefix('api');
  nestApp.enableCors();
  nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await nestApp.init();

  return serverlessExpress({ app: expressApp });
}

// Use 'as Handler' type assertion
export const handler = (async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse | void> => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  
  return await cachedServer(event, context);
}) as Handler;