import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { INestApplication } from '@nestjs/common';

// Create Express instance
const expressApp = express();
let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
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

    console.log('NestJS application initialized');

    // Only listen on a port for local development
    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 3000;
      await app.listen(port);
      console.log(`Application is running on: http://localhost:${port}/api`);
    }
  }

  return expressApp;
}

// Initialize the app immediately
bootstrap();

// Export a handler function for Vercel
export default async (req: any, res: any) => {
  await bootstrap();
  return expressApp(req, res);
};
