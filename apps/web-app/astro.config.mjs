import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react(), solid(), svelte()],
  server: {
    host: true,
    port: 4321
  },
  vite: {
    server: {
      allowedHosts: ['web-app', 'localhost', '127.0.0.1']
    }
  }
});
