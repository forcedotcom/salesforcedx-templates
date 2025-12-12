import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path';

export default defineConfig(() => {
  return {
    plugins: [react()],
    base: '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    build: {
      outDir: resolve(__dirname, 'dist'),
      assetsDir: 'assets',
      sourcemap: false,
    },

    test: {
      root: resolve(__dirname),
      environment: 'happy-dom',
      setupFiles: ['./src/test-setup/setup.ts'],
      include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      exclude: ['node_modules/', 'dist/'],
    },
  };
});

