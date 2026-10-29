import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA: serve index.html for all routes
      strict: false           // don't fail on "dynamic routes"
    }),
    // Generate just the SPA shell; the client router handles the rest
    prerender: { entries: ['/'] }
  },
  preprocess: vitePreprocess()
};
