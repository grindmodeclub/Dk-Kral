import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  ssr: {
    // framer-motion a lucide-react sa pri prerenderi bundlujú, aby sa ESM/CJS nebili v Node
    noExternal: ['framer-motion', 'lucide-react', 'react-helmet-async'],
  },
});
