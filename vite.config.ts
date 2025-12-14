import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // IMPORTANT for GitHub Pages project sites:
  // https://<username>.github.io/<repo-name>/
  base: '/agora-academy/',
  plugins: [react()],
})
