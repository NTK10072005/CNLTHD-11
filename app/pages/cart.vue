<!-- app/pages/cart.vue -->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Giỏ Hàng Của Bạn</h1>
      <p class="mt-1 text-sm text-slate-500">Xem lại các sản phẩm bạn đã chọn trước khi đặt hàng.</p>
    </div>

    <!-- ClientOnly bảo vệ tránh lỗi Hydration Mismatch từ localStorage -->
    <ClientOnly>
      <!-- Trường hợp Giỏ hàng trống -->
      <div v-if="cart.length === 0" class="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <IconCart class="h-8 w-8" />
        </div>
        <h2 class="text-lg font-bold text-slate-800">Giỏ hàng của bạn đang trống</h2>
        <p class="mt-1 text-xs text-slate-500">Hãy dạo quanh cửa hàng để chọn những món đồ công nghệ yêu thích nhé!</p>
        <NuxtLink
          to="/products"
          class="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          Khám phá sản phẩm ngay
        </NuxtLink>
      </div>

      <!-- Trường hợp Có sản phẩm -->
      <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <!-- Bảng danh sách sản phẩm (8 cột) -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
          <div class="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
            <h2 class="text-sm font-bold text-slate-800">Danh sách món hàng ({{ totalItems }})</h2>
          </div>

          <ul class="divide-y divide-slate-100">
            <li v-for="item in cart" :key="item.id" class="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <!-- Ảnh -->
              <NuxtLink :to="`/products/${item.id}`" class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <img :src="item.image" :alt="item.name" class="h-full w-full object-cover" />
              </NuxtLink>

              <!-- Thông tin -->
              <div class="flex-1">
                <NuxtLink :to="`/products/${item.id}`" class="text-sm font-bold text-slate-800 hover:text-blue-600">
                  {{ item.name }}
                </NuxtLink>
                <div class="mt-1 text-xs font-semibold text-slate-500">
                  Đơn giá: {{ formatPrice(item.price) }}
                </div>
              </div>

              <!-- Bộ tăng giảm số lượng -->
              <div class="flex items-center rounded-lg border border-slate-200 bg-white">
                <button
                  type="button"
                  class="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  @click="updateQuantity(item.id, item.quantity - 1)"
                >
                  -
                </button>
                <span class="w-8 text-center text-xs font-bold text-slate-800">{{ item.quantity }}</span>
                <button
                  type="button"
                  class="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  @click="updateQuantity(item.id, item.quantity + 1)"
                >
                  +
                </button>
              </div>

              <!-- Thành tiền -->
              <div class="w-28 text-right text-sm font-extrabold text-slate-900">
                {{ formatPrice(item.price * item.quantity) }}
              </div>

              <!-- Nút xóa -->
              <button
                type="button"
                class="text-xs text-rose-500 hover:text-rose-700"
                @click="removeFromCart(item.id)"
                title="Xóa món này"
              >
                ✕
              </button>
            </li>
          </ul>

          <div class="border-t border-slate-100 p-4 text-right">
            <button
              type="button"
              class="text-xs font-medium text-slate-500 hover:text-rose-600"
              @click="clearCart"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>
        </div>

        <!-- Tóm tắt thanh toán (4 cột) -->
        <div class="lg:col-span-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="mb-4 text-base font-bold text-slate-900">Tóm tắt đơn hàng</h2>

            <div class="space-y-3 text-xs text-slate-600">
              <div class="flex justify-between">
                <span>Tổng số lượng:</span>
                <span class="font-bold text-slate-800">{{ totalItems }} món</span>
              </div>
              <div class="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span class="font-bold text-emerald-600">Miễn phí</span>
              </div>
              <div class="border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between text-base font-extrabold text-slate-900">
                  <span>Tổng thanh toán:</span>
                  <span class="text-blue-600">{{ formatPrice(totalPrice) }}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
              @click="navigateTo('/checkout')"
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>

      <!-- Fallback trong lúc máy khách hydrate -->
      <template #fallback>
        <div class="py-12 text-center text-xs text-slate-400">
          Đang tải thông tin giỏ hàng...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Giỏ Hàng Của Bạn | Cửa Hàng Nuxt 4',
});

const { cart, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
const { formatPrice } = useFormatPrice();
</script>
