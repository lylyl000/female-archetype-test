import { defineConfig } from "vite";

export default defineConfig({
  // 静态站点部署（Vercel/Netlify/CF Pages）一般保持默认即可
  server: {
    port: 5173,
    strictPort: true,
  },
});

