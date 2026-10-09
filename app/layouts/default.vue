<script setup>
import { ref } from 'vue'
import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/vue/24/outline'

const searchText = ref('')
const activePanel = ref('')
const route = useRoute()
const { user, logout } = useAuth()
const { cart, totalItems, totalPrice, removeFromCart, cartToast } = useCart()
const { formatPrice } = useFormatPrice()
const accountLabel = computed(() => user.value?.name || user.value?.username || 'Tài khoản')
const pinHeader = computed(() => route.path === '/' || route.path.startsWith('/products'))

function handleCartClick() {
  togglePanel('cart')
}

function togglePanel(panel) {
  activePanel.value = activePanel.value === panel ? '' : panel
}

async function handleLogout() {
  logout()
  activePanel.value = ''
  await navigateTo('/')
}

watch(
  () => route.query.search,
  (newSearch) => {
    searchText.value = typeof newSearch === 'string' ? newSearch : ''
  },
  { immediate: true }
)

function submitSearch() {
  const query = searchText.value.trim()
  if (query) {
    navigateTo({ path: '/products', query: { search: query } })
  } else {
    // Nếu để trống ô tìm kiếm và bấm Enter/Tìm kiếm -> Quay về danh sách tất cả sản phẩm
    navigateTo({ path: '/products' })
  }
}

</script>

<template>
  <div style="min-height: 100vh; display: flex; flex-direction: column">
    <div :class="{ 'sticky top-0 z-40': pinHeader }">
    <header class="relative z-20 flex min-h-[16.67vh] flex-wrap items-center gap-3 bg-gradient-to-r from-[#071b2b] via-[#0c2a3c] to-[#103c4b] px-5 py-4 shadow-[0_12px_34px_#061c2a30] sm:gap-[3vw] sm:px-[7vw] md:flex-nowrap md:py-5 xl:px-[104px]">
      <NuxtLink class="grid h-12 w-14 flex-none place-items-center md:h-14 md:w-[clamp(64px,7vw,88px)]" to="/" aria-label="Trang chủ">
        <img class="max-h-[88%] max-w-[92%] -translate-y-1 object-contain md:-translate-y-2" src="/icon/logo-11.png" alt="Shop điện tử 11" />
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
          class="relative flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-xs font-semibold text-[#e7f4f5] hover:text-[#62e1dc]"
          type="button"
          :aria-expanded="activePanel === 'cart'"
          @click="handleCartClick"
        >
          <div class="relative">
            <ShoppingCartIcon class="size-10" aria-hidden="true" />
            <span
              v-if="totalItems > 0"
              class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-extrabold text-white shadow"
            >
              {{ totalItems }}
            </span>
          </div>
          <span>Giỏ hàng</span>
        </button>

        <button
          class="flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent px-1.5 py-1 text-xs font-semibold text-[#e7f4f5] hover:text-[#62e1dc]"
          type="button"
          :aria-expanded="activePanel === 'account'"
          @click="togglePanel('account')"
        >
          <UserCircleIcon class="size-10" aria-hidden="true" />
          <span class="max-w-24 truncate" :title="accountLabel">{{ accountLabel }}</span>
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
        <aside v-if="activePanel" class="absolute right-4 top-[calc(100%-6px)] z-30 w-[min(380px,calc(100vw-32px))] rounded-xl border border-[#e8edf5] bg-white p-[22px] shadow-[0_20px_55px_#18294d24] sm:right-[7vw] md:right-[clamp(20px,7vw,104px)] md:top-[calc(50%+54px)]" aria-live="polite">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="m-0 text-base font-bold text-slate-900">
              {{ activePanel === 'cart' ? `Giỏ hàng (${totalItems})` : 'Tài khoản' }}
            </h2>
            <button
              class="cursor-pointer border-0 bg-transparent text-[24px] text-[#667085] hover:text-slate-900"
              type="button"
              aria-label="Đóng"
              @click="activePanel = ''"
            >
              ×
            </button>
          </div>

          <template v-if="activePanel === 'cart'">
            <template v-if="cart.length === 0">
              <div class="py-8 text-center">
                <img src="/icon/cart.svg" alt="Giỏ trống" class="mx-auto h-12 w-12 opacity-30" />
                <p class="my-3 text-sm text-[#69758a]">Giỏ hàng của bạn đang trống.</p>
                <NuxtLink class="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0caaa8] px-5 text-xs font-bold text-white no-underline hover:bg-[#078c91]" to="/products" @click="activePanel = ''">
                  Khám phá sản phẩm
                </NuxtLink>
              </div>
            </template>
            <template v-else>
              <div class="my-3 max-h-64 space-y-3 overflow-y-auto pr-1">
                <div v-for="item in cart" :key="item.id" class="flex items-center gap-3 border-b border-slate-50 pb-2">
                  <img :src="item.image" :alt="item.name" class="h-12 w-12 rounded-lg border border-slate-100 object-contain p-1" />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-xs font-bold text-slate-800">{{ item.name }}</p>
                    <p class="text-[11px] text-slate-500">x{{ item.quantity }} · {{ formatPrice(item.price) }}</p>
                  </div>
                  <button type="button" class="text-xs text-rose-500 hover:text-rose-700" @click="removeFromCart(item.id)">
                    ✕
                  </button>
                </div>
              </div>
              <div class="border-t border-slate-100 pt-3">
                <div class="mb-3 flex items-center justify-between text-xs">
                  <span class="font-medium text-slate-600">Tổng cộng:</span>
                  <span class="text-sm font-extrabold text-blue-600">{{ formatPrice(totalPrice) }}</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <NuxtLink class="flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50" to="/cart" @click="activePanel = ''">
                    Xem giỏ hàng
                  </NuxtLink>
                  <NuxtLink class="flex min-h-10 items-center justify-center rounded-xl bg-[#0caaa8] text-xs font-bold text-white hover:bg-[#078c91]" to="/checkout" @click="activePanel = ''">
                    Thanh toán
                  </NuxtLink>
                </div>
              </div>
            </template>
          </template>

          <template v-else-if="user">
            <div class="mt-5 grid gap-2">
              <NuxtLink class="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#213946] no-underline hover:bg-[#f1f6f7]" to="/orders" @click="activePanel = ''">
                Lịch sử đơn hàng
              </NuxtLink>
              <button class="flex min-h-11 cursor-pointer items-center rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-[#bd3434] hover:bg-rose-50" type="button" @click="handleLogout">
                Đăng xuất
              </button>
            </div>
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

    <nav class="border-b border-slate-200 bg-white" aria-label="Điều hướng chính">
      <div class="mx-auto flex w-full max-w-[1280px] gap-3 px-4 sm:px-6 lg:px-8">
        <NuxtLink
          to="/"
          class="inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-sm font-semibold text-[#52616d] no-underline transition-colors hover:border-[#46d7d0] hover:text-[#087e83]"
          active-class="!border-[#0caaa8] !text-[#087e83]"
          exact-active-class="!border-[#0caaa8] !text-[#087e83]"
        >
          Trang chủ
        </NuxtLink>
        <NuxtLink
          to="/products"
          class="inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-sm font-semibold text-[#52616d] no-underline transition-colors hover:border-[#46d7d0] hover:text-[#087e83]"
          active-class="!border-[#0caaa8] !text-[#087e83]"
        >
          Danh mục
        </NuxtLink>
      </div>
    </nav>
    </div>

    <main
      style="
        flex: 1;
        max-width: 1280px;
        margin: 0 auto;
        width: 100%;
        padding: 2rem 1rem;
      "
    >
      <slot />
    </main>
    <Footer />

    <!-- Toast Thông báo giỏ hàng toàn cục -->
    <Transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cartToast.show"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm"
      >
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
          ✓
        </div>
        <div class="text-xs">
          <p class="font-bold text-slate-800">{{ cartToast.message }}</p>
          <p v-if="cartToast.subMessage" class="text-[11px] text-slate-500 line-clamp-1">
            {{ cartToast.subMessage }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
