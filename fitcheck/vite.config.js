import { defineConfig } from 'vite';

export default defineConfig({
  base: '/fitcheck/',
  build: {
    outDir: '../dist/fitcheck',
    emptyOutDir: true
  }
});
