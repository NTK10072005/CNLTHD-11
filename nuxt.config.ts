// nuxt.config.ts
export default defineNuxtConfig({

  compatibilityDate: "2025-07-15",

  future: {
    compatibilityVersion: 4, // Kích hoạt cấu trúc thư mục Nuxt 4
  },

  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],

  // Cấu hình Hybrid Rendering: Phân hệ Admin chạy SPA thuần túy (Client-only)
  routeRules: {
    "/admin/**": { ssr: false },
  },
});
