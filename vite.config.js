import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Añadimos de nuevo las opciones de build para optimizar
  build: {
    rollupOptions: {
      external: [
        '@babel/parser',
        '@babel/traverse',
        '@babel/generator',
        '@babel/types'
      ]
    }
  },
  // Y la configuración del servidor para el desarrollo
  server: {
    cors: true,
    headers: {
        'Cross-Origin-Embedder-Policy': 'credentialless',
    },
    allowedHosts: true,
  },
});