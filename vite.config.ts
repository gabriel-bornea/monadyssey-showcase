import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    checker({ typescript: true })
  ],
  build: {
    sourcemap: true,
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 9999,
    open: true
  }
});
