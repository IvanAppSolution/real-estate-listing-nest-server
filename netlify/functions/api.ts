import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

let cachedApp: NestFastifyApplication | null = null;

async function bootstrap(): Promise<NestFastifyApplication> {
  try {
    console.log('=== BOOTSTRAP START ===');
    
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
      { 
        bodyParser: false,
        logger: ['error', 'warn', 'log', 'debug', 'verbose']
      }
    );

    console.log('=== APP CREATED ===');

    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    console.log('=== STARTING APP.INIT() ===');
    await app.init();
    console.log('=== APP.INIT() COMPLETED ===');

    const fastifyInstance = app.getHttpAdapter().getInstance();
    await fastifyInstance.ready();
    
    console.log('=== BOOTSTRAP COMPLETE ===');

    return app;
  } catch (error: unknown) {
    console.error('=== BOOTSTRAP FAILED ===');
    
    if (error instanceof Error) {
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      // Type-safe check for response property
      if (typeof error === 'object' && error !== null && 'response' in error) {
        console.error('Error Response:', JSON.stringify(error.response, null, 2));
      }
    } else {
      console.error('Unknown error type:', String(error));
    }
    
    throw error;
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Mark context as used (or remove if truly unused)
  void context;

  try {
    if (!cachedApp) {
      console.log('=== COLD START - INITIALIZING APP ===');
      cachedApp = await bootstrap();
    }

    const fastifyInstance = cachedApp.getHttpAdapter().getInstance();

    // Process the path
    const netlifyPath = event.path || '/';
    const strippedPath = netlifyPath.startsWith('/.netlify/functions/api')
      ? netlifyPath.replace('/.netlify/functions/api', '')
      : netlifyPath;

    const queryString = event.rawQuery ? `?${event.rawQuery}` : '';
    const url = (strippedPath || '/') + queryString;
    const method = (event.httpMethod || 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    const headers = event.headers || {};
    const body = event.body || undefined;

    console.log(`=== REQUEST: ${method} ${url} ===`);

    // Use Fastify's inject method to handle the request
    const response = await fastifyInstance.inject({
      method,
      url,
      headers,
      payload: body,
    });

    const statusCode = response.statusCode || 200;
    console.log(`=== RESPONSE: ${statusCode} ===`);

    // Safely convert headers to Record<string, string>
    const responseHeaders: Record<string, string> = {};
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          responseHeaders[key] = value;
        } else if (Array.isArray(value)) {
          responseHeaders[key] = value.join(', ');
        } else if (value !== undefined) {
          responseHeaders[key] = String(value);
        }
      });
    }

    // Safely handle response body
    let responseBody: string;
    if (typeof response.body === 'string') {
      responseBody = response.body;
    } else if (response.body === null || response.body === undefined) {
      responseBody = '';
    } else {
      responseBody = JSON.stringify(response.body);
    }

    return {
      statusCode,
      headers: responseHeaders,
      body: responseBody,
    };
  } catch (error: unknown) {
    console.error('=== HANDLER ERROR ===');
    console.error('Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error during request handling',
        error: errorMessage,
      }),
    };
  }
};
