import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@content': path.resolve(__dirname, 'src/content'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    target: 'chrome120',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
  server: { port: 5173, strictPort: true },
});
