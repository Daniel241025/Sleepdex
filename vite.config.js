import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' = caminhos relativos: funciona em qualquer subpasta do GitHub Pages.
export default defineConfig({ plugins: [react()], base: './' })
