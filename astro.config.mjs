// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isBuildCommand = process.argv.includes('build');
const isCheckCommand = process.argv.includes('check');

// https://astro.build/config
export default defineConfig({
  vite: {
    cacheDir: isBuildCommand
      ? 'node_modules/.vite-build'
      : isCheckCommand
        ? 'node_modules/.vite-check'
        : 'node_modules/.vite-dev',
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  },

  integrations: [react()]
});
