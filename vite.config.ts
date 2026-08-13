import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'node:url';  // 使用 node:url 前缀

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest-setup.ts'],
    alias: {
      '$lib': resolve(__dirname, 'src/lib'),
      '$app': resolve(__dirname, '.svelte-kit/runtime/app'),
    },
    deps: {
      inline: ['@testing-library/svelte'],
    },
  },
});