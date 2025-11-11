import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Import the compiled AppModule from dist
const getAppModule = async () => {
  const { AppModule } = await import('../dist/app.module');
  return AppModule;
};

const expressApp = express();
let isInitialized = false;

async function bootstrap() {
  if (!isInitialized) {
    const AppModule = await getAppModule();
    
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
    isInitialized = true;
    console.log('NestJS application initialized for Vercel');
  }
}

export default async (req: any, res: any) => {
  await bootstrap();
  expressApp(req, res);
};