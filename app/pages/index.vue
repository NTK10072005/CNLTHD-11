<script setup>
import { ref } from 'vue'

definePageMeta({ layout: false })

const searchText = ref('')
const activePanel = ref('')

function togglePanel(panel) {
  activePanel.value = activePanel.value === panel ? '' : panel
}

function submitSearch() {
  const query = searchText.value.trim()
  if (query) {
    navigateTo({ path: '/products', query: { search: query } })
  }
}
</script>

<template>
  <main class="min-h-screen min-w-[320px] bg-[#eef4f6] bg-[radial-gradient(ellipse_at_82%_88%,#d8f1f3_0,transparent_34%)] font-sans text-[#142333]">
    <header class="relative z-20 flex min-h-[25vh] flex-wrap items-center gap-3 bg-gradient-to-r from-[#071b2b] via-[#0c2a3c] to-[#103c4b] px-5 py-6 shadow-[0_12px_34px_#061c2a30] sm:gap-[3vw] sm:px-[7vw] md:flex-nowrap md:py-8 xl:px-[104px]">
      <NuxtLink class="grid h-14 w-[68px] flex-none place-items-center md:h-[66px] md:w-[clamp(72px,8vw,108px)]" to="/" aria-label="Trang chủ">
        <img class="max-h-[90%] max-w-[94%] -translate-y-2 object-contain md:-translate-y-[10px]" src="/icon/logo-11.png" alt="Shop điện tử 11" />
      </NuxtLink>

      <form class="order-2 flex h-12 min-w-[120px] basis-full items-center rounded-xl border border-[#42616f] bg-[#f5fafb] py-[5px] pl-[18px] pr-[6px] focus-within:border-[#46d7d0] focus-within:shadow-[0_0_0_4px_#46d7d026] md:order-none md:h-[54px] md:min-w-0 md:basis-auto md:flex-1" role="search" @submit.prevent="submitSearch">
        <input
          class="min-w-0 flex-1 border-0 bg-transparent outline-none"
          v-model="searchText"
          type="search"
          placeholder="Bạn đang tìm sản phẩm nào?"
          aria-label="Tìm kiếm sản phẩm"
        />
        <button class="grid size-[42px] flex-none cursor-pointer place-items-center rounded-[10px] border-0 bg-[#0caaa8] text-white hover:bg-[#078c91]" type="submit" aria-label="Tìm kiếm">
          <svg class="w-5 fill-none stroke-current [stroke-width:1.8] [stroke-linecap:round]" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 5 5" />
          </svg>
        </button>
      </form>

      <div class="order-3 flex basis-full items-center justify-end gap-2 md:order-none md:basis-auto md:gap-[clamp(10px,2vw,26px)]">
        <button
          class="flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-xs font-semibold text-[#e7f4f5] hover:text-[#62e1dc]"
          type="button"
          :aria-expanded="activePanel === 'cart'"
          @click="togglePanel('cart')"
        >
          <img class="size-12 rounded object-contain md:size-[52px]" src="/icon/icon-gio-hang.jpg" alt="" />
          <span>Giỏ hàng</span>
        </button>

        <button
          class="flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-xs font-semibold text-[#e7f4f5] hover:text-[#62e1dc]"
          type="button"
          :aria-expanded="activePanel === 'account'"
          @click="togglePanel('account')"
        >
          <img class="size-[38px] object-contain md:size-11" src="/icon/icon_account.webp" alt="" />
          <span>Tài khoản</span>
        </button>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-2 opacity-0"
      >
        <aside v-if="activePanel" class="absolute right-4 top-[calc(100%-6px)] z-30 w-[min(360px,calc(100vw-32px))] rounded-xl border border-[#e8edf5] bg-white p-[22px] shadow-[0_20px_55px_#18294d24] sm:right-[7vw] md:right-[clamp(20px,7vw,104px)] md:top-[calc(50%+54px)]" aria-live="polite">
          <div class="flex items-center justify-between">
            <h2 class="m-0 text-lg">{{ activePanel === 'cart' ? 'Giỏ hàng' : 'Tài khoản' }}</h2>
            <button
              class="cursor-pointer border-0 bg-transparent text-[27px] text-[#667085]"
              type="button"
              aria-label="Đóng"
              @click="activePanel = ''"
            >
              ×
            </button>
          </div>

          <template v-if="activePanel === 'cart'">
            <p class="my-5 text-sm leading-[1.65] text-[#69758a]">Giỏ hàng của bạn đang trống.</p>
            <NuxtLink class="flex min-h-11 items-center justify-center rounded-[10px] bg-[#0caaa8] text-sm font-bold text-white no-underline hover:bg-[#078c91]" to="/products" @click="activePanel = ''">
              Tiếp tục mua sắm
            </NuxtLink>
          </template>

          <template v-else>
            <p class="my-5 text-sm leading-[1.65] text-[#69758a]">
              Đăng nhập để theo dõi đơn hàng và lưu sản phẩm yêu thích.
            </p>
            <div class="grid gap-2.5">
              <NuxtLink class="flex min-h-11 items-center justify-center rounded-[10px] bg-[#0caaa8] text-sm font-bold text-white no-underline hover:bg-[#078c91]" to="/login" @click="activePanel = ''">Đăng nhập</NuxtLink>
              <NuxtLink class="flex min-h-11 items-center justify-center text-sm font-bold text-[#087e83] no-underline hover:underline" to="/register" @click="activePanel = ''">Tạo tài khoản</NuxtLink>
            </div>
          </template>
        </aside>
      </Transition>
    </header>

    <section class="flex min-h-[75vh] flex-col items-start justify-center px-6 py-[clamp(48px,10vh,110px)] md:px-[12vw] xl:px-[180px]">
      <p class="mb-3.5 text-xs font-extrabold tracking-[0.12em] text-[#078c91]">CÔNG NGHỆ CHO CUỘC SỐNG</p>
      <h1 class="m-0 max-w-[700px] text-[clamp(34px,5.5vw,68px)] leading-[1.12]">Khám phá thế giới điện tử</h1>
      <p class="mt-[18px] text-[#69758a]">Điện thoại, laptop và phụ kiện chính hãng dành cho bạn.</p>
      <NuxtLink class="mt-7 rounded-lg bg-[#0caaa8] px-[18px] py-[13px] font-bold text-white no-underline hover:bg-[#078c91]" to="/products">Khám phá sản phẩm <span class="ml-2" aria-hidden="true">→</span></NuxtLink>
    </section>
  </main>
</template>
