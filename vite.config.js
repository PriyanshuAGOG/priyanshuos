import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: { portfolio: 'index.html', mascotStudio: 'mascot-studio.html' },
    },
  },
});
