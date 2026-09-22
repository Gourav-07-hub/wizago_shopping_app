import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // vite.config runs in Node, not the browser
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000/api';
  // Proxy target must be the backend origin WITHOUT the trailing /api,
  // otherwise requests become /api/api/... (double prefix).
  const proxyTarget = apiUrl.replace(/\/api\/?$/, '');

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
})
