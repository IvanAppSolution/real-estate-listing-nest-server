import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

let cachedApp: NestFastifyApplication;

async function bootstrap(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bodyParser: false }
  );

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.init();
  const fastifyInstance = app.getHttpAdapter().getInstance();
  await fastifyInstance.ready();

  return app;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }

  const fastifyInstance = cachedApp.getHttpAdapter().getInstance();

  const netlifyPath = event.path;
  const strippedPath = netlifyPath.startsWith('/.netlify/functions/api')
    ? netlifyPath.replace('/.netlify/functions/api', '')
    : netlifyPath;

  const url = (strippedPath || '/') + (event.rawQuery ? `?${event.rawQuery}` : '');
  const method = event.httpMethod || 'GET';
  const headers = event.headers || {};
  const body = event.body;

  const response = await fastifyInstance.inject({
    method: method as any,
    url,
    headers,
    payload: body,
  });

  return {
    statusCode: response.statusCode,
    headers: response.headers as any,
    body: response.body,
  };
};
