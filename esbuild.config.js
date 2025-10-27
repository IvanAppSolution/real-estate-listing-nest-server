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
    
    // Optional NestJS modules
    '@nestjs/microservices',
    '@nestjs/websockets',
    '@nestjs/platform-socket.io',
    'cache-manager',
    'class-transformer/storage',
  ],
  // Force resolve express from node_modules
  alias: {
    'express': path.resolve(__dirname, 'node_modules/express'),
  },
  loader: {
    '.ts': 'ts',
  },
  tsconfig: 'tsconfig.json',
  logLevel: 'info',
  metafile: true,
  mainFields: ['module', 'main'],
  conditions: ['node'],
}).then((result) => {
  console.log('✅ Function bundled successfully');
  
  // Log bundle size
  if (result.metafile) {
    const outputs = result.metafile.outputs;
    for (const [file, data] of Object.entries(outputs)) {
      const size = (data.bytes / 1024 / 1024).toFixed(2);
      console.log(`📦 ${file}: ${size} MB`);
    }
  }
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});