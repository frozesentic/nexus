import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force a single Three.js instance shared between our code and react-force-graph-3d
    dedupe: ['three'],
  },
  optimizeDeps: {
    include: ['react-force-graph-3d', 'three'],
  },
});
