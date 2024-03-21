/**
 * @type {import('vite').UserConfig}
 */

import { defineConfig } from "vite";
import { VitePWA as vitePWA } from "vite-plugin-pwa";
import webmanifest from "./manifest.json";

// ignore unused exports default
export default defineConfig({
  plugins: [
    vitePWA({
      devOptions: {
        enabled: true,
      },
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: webmanifest,
      workbox: {
        maximumFileSizeToCacheInBytes: 10000000,
        globPatterns: ["**/*.{js,css,html,png,svg,wasm}"],
      },
    }),
  ],
  base: "/delayedgram/",
  build: {
    assetsInlineLimit: 0,
    outDir: "docs",
    target: "esnext",
  },
  worker: {
    format: "es",
  },
});
