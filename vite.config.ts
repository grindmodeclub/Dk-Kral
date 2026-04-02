import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'remove-problematic-files',
    apply: 'build',
    enforce: 'pre',
    async buildStart() {
      const publicDir = path.resolve(__dirname, 'public');
      try {
        const files = fs.readdirSync(publicDir);
        files.forEach(file => {
          if (file.includes('copy')) {
            const filePath = path.join(publicDir, file);
            try {
              fs.unlinkSync(filePath);
              console.log(`Removed: ${file}`);
            } catch (e) {
              console.warn(`Could not remove ${file}:`, e.message);
            }
          }
        });
      } catch (e) {
        console.warn('Could not clean public directory:', e.message);
      }
    }
  }],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
