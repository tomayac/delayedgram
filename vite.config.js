/**
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from 'vite';
import { VitePWA as vitePWA } from 'vite-plugin-pwa';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import webmanifest from './manifest.json';

// ignore unused exports default
export default defineConfig({
  plugins: [
    dynamicImportVars({
      include: ['./filter-*.js'],
    }),
    vitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: webmanifest,
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000,
        globPatterns: ['**/*.{js,css,html,png,svg,wasm}'],
      },
    }),
  ],
  base: '/delayedgram/',
  build: {
    assetsInlineLimit: 0,
    outDir: 'docs',
    target: 'esnext',
    minify: 'esbuild',
  },
  worker: {
    format: 'es',
  },
});
