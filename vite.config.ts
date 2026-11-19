import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './', // GitHub Pages: працює у вкладеній директорії
  plugins: [react(), tailwindcss()],
  test: { environment: 'node' },
});
