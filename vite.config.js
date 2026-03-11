import { defineConfig } from "vite";
import { readFileSync } from 'fs'
import react from "@vitejs/plugin-react";

const { version } = JSON.parse(readFileSync('package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   define: {
    __APP_VERSION__: JSON.stringify(version)
  }
});
