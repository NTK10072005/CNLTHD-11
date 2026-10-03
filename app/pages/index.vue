<template>
  <main class="min-h-screen min-w-[320px] bg-[#eef4f6] bg-[radial-gradient(ellipse_at_82%_88%,#d8f1f3_0,transparent_34%)] font-sans text-[#142333]">
    <section
      class="relative left-1/2 -mt-8 mb-12 aspect-[3/1] w-[96vw] max-w-[1440px] max-h-[480px] -translate-x-1/2 overflow-hidden bg-[#e9e7e4]"
      aria-label="Banner khuyến mãi"
      aria-roledescription="carousel"
    >
      <img
        v-for="(banner, index) in banners"
        :key="banner.src"
        :src="banner.src"
        :alt="banner.alt"
        class="absolute inset-0 size-full object-cover transition-opacity duration-700"
        :class="currentBanner === index ? 'opacity-100' : 'opacity-0'"
        :aria-hidden="currentBanner !== index"
        :fetchpriority="index === 0 ? 'high' : 'auto'"
      />

      <button
        class="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-6 sm:size-12"
        type="button"
        aria-label="Banner trước"
        @click="showBanner(currentBanner - 1)"
      >
        <ChevronLeftIcon class="size-6" aria-hidden="true" />
      </button>
      <button
        class="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-6 sm:size-12"
        type="button"
        aria-label="Banner tiếp theo"
        @click="showBanner(currentBanner + 1)"
      >
        <ChevronRightIcon class="size-6" aria-hidden="true" />
      </button>

      <div class="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-5" role="group" aria-label="Chọn banner">
        <button
          v-for="(banner, index) in banners"
          :key="banner.src"
          class="h-2.5 rounded-full border border-white/80 transition-all"
          :class="currentBanner === index ? 'w-7 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'"
          type="button"
          :aria-label="`Chuyển đến banner ${index + 1}`"
          :aria-current="currentBanner === index ? 'true' : undefined"
          @click="showBanner(index)"
        />
      </div>
    </section>

    <section class="mx-auto flex min-h-[75vh] max-w-[1280px] flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="mb-2 text-xs font-extrabold text-[#078c91]">ĐƯỢC NHIỀU NGƯỜI LỰA CHỌN</p>
          <h1 class="m-0 text-3xl font-extrabold text-[#142333] sm:text-4xl">Sản phẩm nổi bật</h1>
          <p class="mt-2 text-sm text-[#69758a]">Một vài lựa chọn được yêu thích cho công việc và giải trí.</p>
        </div>
        <NuxtLink class="text-sm font-bold text-[#087e83] no-underline hover:underline" to="/products">
          Xem tất cả sản phẩm <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="status === 'pending'" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="item in 4" :key="item" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div class="h-52 rounded-xl bg-slate-200"></div>
          <div class="mt-4 h-4 w-3/4 rounded bg-slate-200"></div>
          <div class="mt-3 h-4 w-1/2 rounded bg-slate-200"></div>
        </div>
      </div>

      <p v-else-if="error" class="rounded-xl border border-rose-200 bg-white p-6 text-sm text-rose-700">
        Chưa thể tải sản phẩm nổi bật. <NuxtLink class="font-semibold text-[#087e83]" to="/products">Xem danh mục sản phẩm</NuxtLink>
      </p>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import type { Product } from '~/types/product'

const banners = [
  { src: '/banner/Gemini_Generated_Image_ih8ty1ih8ty1ih8t.png', alt: 'Khuyến mãi điện thoại iPhone' },
  { src: '/banner/Gemini_Generated_Image_ym8rgmym8rgmym8r.png', alt: 'Ưu đãi laptop' },
  { src: '/banner/Gemini_Generated_Image_rgwof2rgwof2rgwo.png', alt: 'Ưu đãi tai nghe' },
  { src: '/banner/Gemini_Generated_Image_e4yckxe4yckxe4yc.png', alt: 'Khuyến mãi loa party' },
]

const currentBanner = ref(0)
let bannerTimer: ReturnType<typeof setInterval> | undefined

function showBanner(index: number) {
  currentBanner.value = (index + banners.length) % banners.length
}

onMounted(() => {
  bannerTimer = setInterval(() => showBanner(currentBanner.value + 1), 5000)
})

onUnmounted(() => {
  if (bannerTimer) clearInterval(bannerTimer)
})

const { data: products, status, error } = await useFetch<Product[]>('/api/products', {
  key: 'home-featured-products',
  default: () => [],
})

const featuredProductIds = [7, 8, 9, 11]
const featuredProducts = computed(() =>
  featuredProductIds
    .map(id => products.value.find(product => product.id === id))
    .filter((product): product is Product => product !== undefined),
)
</script>
