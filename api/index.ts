import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

// Import AppModule - adjust path based on your build output
let cachedApp: any = null;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  console.log('Bootstrapping NestJS app...');

  // Dynamically import the compiled AppModule
  const { AppModule } = await import('../dist/app.module.js');

  // Create a fresh Express instance for each bootstrap
  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn', 'log'] }
  );

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

  cachedApp = expressApp;
  return expressApp;
}

export default async (req: Request, res: Response) => {
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('Error bootstrapping app:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};