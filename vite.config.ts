import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Three.js ecosystem - kept separate for lazy loading
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          // Animation libraries
          if (id.includes('gsap') || id.includes('motion')) {
            return 'vendor-motion';
          }
          // Postprocessing & utilities
          if (id.includes('postprocessing') || id.includes('gl-matrix')) {
            return 'vendor-graphics';
          }
          // React core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-core';
          }
        }
      }
    },
    // Increase chunk size limits to accommodate Three.js
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true,
  }
})
