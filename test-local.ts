import express from 'express';
import { HandlerEvent, HandlerContext } from '@netlify/functions';

const app = express();
const PORT = process.env.PORT || 4000;

async function loadHandler() {
  // Correct path: dist/netlify/functions/api (no 'src' in path)
  const { handler } = await import('./netlify/functions/api');
  return handler;
}

// Middleware to convert Express request to Netlify event
app.use(async (req, res) => {
  const event: HandlerEvent = {
    rawUrl: `http://localhost:${PORT}${req.url}`,
    rawQuery: req.url.split('?')[1] || '',
    path: req.path,
    httpMethod: req.method,
    headers: req.headers as any,
    multiValueHeaders: {},
    queryStringParameters: req.query as any,
    multiValueQueryStringParameters: {},
    body: JSON.stringify(req.body),
    isBase64Encoded: false,
  };

  const context: HandlerContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'api',
    functionVersion: '1',
    invokedFunctionArn: 'local',
    memoryLimitInMB: '1024',
    awsRequestId: 'local-' + Date.now(),
    logGroupName: 'local',
    logStreamName: 'local',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  try {
    const handler = await loadHandler();
    const response = await handler(event, context);
    
    if (response && typeof response === 'object' && 'statusCode' in response) {
      res.status(response.statusCode);
      
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
      }
      
      res.send(response.body);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local test server running at http://localhost:${PORT}`);
  console.log(`Test your API: http://localhost:${PORT}/api/health`);
});