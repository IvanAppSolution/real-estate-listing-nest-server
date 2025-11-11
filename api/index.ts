import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';

let cachedServer: any = null;

async function bootstrap() {
  if (cachedServer) {
    return cachedServer;
  }

  console.log('Bootstrapping NestJS app...');

  // Dynamically import the compiled AppModule
  const { AppModule } = await import('../dist/app.module.js');

  // Create NestJS app without custom Express adapter
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log']
  });

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  await app.init();

  console.log('NestJS app initialized successfully');

  // Get the underlying HTTP server
  const server = app.getHttpServer();
  cachedServer = server;
  
  return server;
}

export default async (req: any, res: any) => {
  try {
    const server = await bootstrap();
    // Let the HTTP server handle the request
    server.emit('request', req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};