import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest-setup.ts'],
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
      '$app': resolve(__dirname, './.svelte-kit/runtime/app')
    }
  },
  resolve: {
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
      '$app': resolve(__dirname, './.svelte-kit/runtime/app')
    }
  }
});