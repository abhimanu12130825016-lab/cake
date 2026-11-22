import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    {
  "branch": "main",
  "content": "import { defineConfig } from 'vite';\n\nexport default defineConfig({\n  base: './',\n  server: {\n    port: 5173,\n    host: true,\n    open: false\n  },\n  build: {\n    outDir: 'dist',\n    sourcemap: true\n  }\n});\n",
  "message": "fix: configure Vite for GitHub Pages subpath deployment",
  "owner": "abhimanu12130825016-lab",
  "path": "vite.config.js",
  "repo": "cake",
  "sha": "9d2bfdc4d052fa6fb39ee0704d8f89c9f1ff775a"
}
