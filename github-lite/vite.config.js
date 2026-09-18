import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    strictPort: false,
  },
  build: {
    target: 'es2015',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
});
