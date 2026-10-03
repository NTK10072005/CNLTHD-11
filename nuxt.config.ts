// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  future: {
    compatibilityVersion: 4, // Kích hoạt cấu trúc thư mục Nuxt 4
  },

  routeRules: {
    "/products/**": { swr: 3600 },
    // SWR Caching Tầng 3
  },

  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
});