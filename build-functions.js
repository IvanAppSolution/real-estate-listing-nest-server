const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['netlify/functions/api.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: 'dist/netlify/functions/api.js',
      format: 'cjs',
      minify: false,
      sourcemap: true,
      external: [
        // Only exclude native modules
        'pg-native',
        'better-sqlite3',
        'sqlite3',
        'tedious',
        'mysql',
        'mysql2',
        'oracledb',
        'pg-query-stream',
      ],
      loader: {
        '.ts': 'ts',
      },
      tsconfig: 'tsconfig.json',
    });
    
    console.log('✅ Function bundled successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();