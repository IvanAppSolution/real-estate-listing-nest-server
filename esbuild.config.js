const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['netlify/functions/api.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/netlify/functions/api.js',
  format: 'cjs',
  minify: false,
  sourcemap: true,
  external: [
    // Native modules that cannot be bundled
    'pg-native',
    'better-sqlite3',
    'sqlite3',
    'tedious',
    'mysql',
    'mysql2',
    'oracledb',
    'pg-query-stream',

    // Optional NestJS microservice dependencies to exclude
    'kafkajs',
    'ioredis',
    'nats',
    'amqplib',
    'amqp-connection-manager', // Often required along with amqplib
    'mqtt',
    'grpc',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
  ],
  loader: {
    '.ts': 'ts',
  },
  tsconfig: 'tsconfig.json',
  logLevel: 'info',
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});