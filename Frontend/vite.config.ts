import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: '봉틈이',
        short_name: '봉틈이',
        description: '봉사는 틈틈이',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // 전체화면 모드
        orientation: 'portrait', // 세로 모드 고정 (선택 사항)
        icons: [
          {
            src: '/봉틈이.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/봉틈이.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})