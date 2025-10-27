const esbuild = require('esbuild');
const path = require('path');

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
    // Native database drivers
    'pg-native',
    'better-sqlite3',
    'sqlite3',
    'tedious',
    'mysql',
    'mysql2',
    'oracledb',
    'pg-query-stream',
    
    // IMPORTANT: Add typeorm here
    'typeorm',

    // Optional NestJS modules
    '@nestjs/microservices',
    '@nestjs/websockets',
    '@nestjs/platform-socket.io',
    'cache-manager',
    'class-transformer/storage',
  ],
  // ... existing code ...
}).then((result) => {
// ... existing code ...
});