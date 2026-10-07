<!-- app/pages/products/[id].vue -->
<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" v-if="product">
    <!-- Breadcrumb điều hướng -->
    <nav class="mb-6 flex items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="transition hover:text-blue-600">Trang chủ</NuxtLink>
      <span>/</span>
      <NuxtLink to="/products" class="transition hover:text-blue-600">Sản phẩm</NuxtLink>
      <span>/</span>
      <span class="font-medium text-slate-800">{{ product.name }}</span>
    </nav>

    <!-- KHỐI 1: MUA HÀNG -->
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <!-- Cột trái: Ảnh sản phẩm (5 cột) -->
      <div class="lg:col-span-5">
        <div class="sticky top-6 flex min-h-[380px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <img
            :src="product.image"
            :alt="product.name"
            class="max-h-80 w-auto object-contain transition-transform duration-300 hover:scale-105"
            @error="onImageError"
          />
        </div>
      </div>

      <!-- Cột phải: Thông tin & Đặt hàng (7 cột) -->
      <div class="flex flex-col lg:col-span-7">
        <div class="mb-2">
          <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
            {{ formatCategory(product.category) }}
          </span>
        </div>

        <h1 class="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {{ product.name }}
        </h1>

        <!-- Trạng thái kho hàng -->
        <div class="mt-3 flex items-center gap-2 text-xs font-semibold">
          <span
            v-if="!product.inStock || product.stock <= 0"
            class="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-rose-700"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Tạm hết hàng
          </span>

          <span
            v-else-if="availableToBuy <= 0"
            class="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-rose-700"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Hết hàng (Bạn đã chọn hết {{ itemInCartCount }}/{{ product.stock }} vào giỏ)
          </span>

          <span
            v-else
            class="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-700"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Còn hàng trong kho ({{ product.stock }} sản phẩm)
          </span>
        </div>

        <!-- Giá tiền -->
        <div class="my-5 rounded-2xl bg-slate-50 p-4">
          <div class="text-3xl font-black text-slate-900">
            {{ formatPrice(product.price) }}
          </div>
        </div>

        <!-- Mô tả ngắn -->
        <p class="text-sm leading-relaxed text-slate-600">
          {{ product.description }}
        </p>

        <!-- Điều chỉnh số lượng & Nút hành động -->
        <div class="mt-6 border-t border-slate-100 pt-6">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Tăng giảm số lượng -->
            <div
              class="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm"
              :class="{ 'opacity-50 pointer-events-none bg-slate-100': !product.inStock || availableToBuy <= 0 }"
            >
              <button
                type="button"
                :disabled="quantity <= 1 || !product.inStock || availableToBuy <= 0"
                class="px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                @click="quantity--"
              >
                -
              </button>
              <span class="w-12 text-center text-sm font-semibold text-slate-800">{{ quantity }}</span>
              <button
                type="button"
                :disabled="quantity >= availableToBuy || !product.inStock"
                class="px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                @click="quantity++"
              >
                +
              </button>
            </div>

            <!-- Nút Thêm vào giỏ -->
            <button
              type="button"
              :disabled="!product.inStock || availableToBuy <= 0"
              class="flex items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-6 py-3 text-sm font-bold text-blue-600 shadow-sm transition hover:bg-blue-50 active:scale-95 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 sm:flex-initial"
              @click="handleAddToCart"
            >
              <img src="/icon/cart.svg" alt="Giỏ hàng" class="h-4 w-4" />
              <span>{{ !product.inStock ? 'Hết hàng' : (availableToBuy <= 0 && itemInCartCount > 0 ? 'Đã thêm tối đa vào giỏ' : 'Thêm vào giỏ hàng') }}</span>
            </button>

            <!-- Nút Mua ngay -->
            <button
              type="button"
              :disabled="!product.inStock || (availableToBuy <= 0 && itemInCartCount === 0)"
              class="flex-1 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-initial"
              @click="handleBuyNow"
            >
              {{ availableToBuy <= 0 && itemInCartCount > 0 ? 'Thanh toán ngay' : 'Mua ngay' }}
            </button>
          </div>

          <!-- Thông báo hỗ trợ nếu đã chọn hết tồn kho vào giỏ -->
          <p v-if="itemInCartCount > 0" class="mt-2.5 text-xs text-slate-500">
            * Bạn đã có <span class="font-bold text-blue-600">{{ itemInCartCount }}</span> sản phẩm này trong giỏ hàng.
            <span v-if="availableToBuy > 0"> Có thể thêm tối đa <span class="font-bold text-emerald-600">{{ availableToBuy }}</span> cái nữa.</span>
            <span v-else class="font-semibold text-amber-600"> Đã đạt giới hạn tồn kho.</span>
          </p>
        </div>
      </div>
    </div>

    <!-- KHỐI 2: BẢNG THÔNG SỐ KỸ THUẬT -->
    <div class="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" v-if="product.specs">
      <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 class="text-lg font-bold text-slate-900">Thông số kỹ thuật chi tiết</h2>
        <span class="text-xs text-slate-400">Đặc tính phần cứng & cấu hình</span>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200">
        <dl class="divide-y divide-slate-200">
          <div
            v-for="(val, key) in product.specs"
            :key="key"
            class="grid grid-cols-3 bg-white px-5 py-3.5 text-xs sm:grid-cols-4 odd:bg-slate-50/60"
          >
            <dt class="font-semibold text-slate-600">{{ key }}</dt>
            <dd class="col-span-2 text-slate-900 sm:col-span-3">{{ val }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Toast Thông báo thêm giỏ hàng thành công -->
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

  <!-- Giao diện khi không tìm thấy sản phẩm -->
  <div v-else class="mx-auto max-w-3xl px-4 py-20 text-center">
    <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <h1 class="text-2xl font-extrabold text-slate-900 sm:text-3xl">
      Không tìm thấy sản phẩm
    </h1>
    <p class="mt-2 text-sm text-slate-500">
      Sản phẩm này không tồn tại hoặc đã ngừng kinh doanh.
    </p>
    <div class="mt-8 flex items-center justify-center gap-4">
      <NuxtLink
        to="/products"
        class="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        ← Quay lại danh mục sản phẩm
      </NuxtLink>
      <NuxtLink
        to="/"
        class="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        Về trang chủ
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

const { formatPrice } = useFormatPrice();
const { cart, addToCart, cartToast } = useCart();

const route = useRoute();
const { data: product } = await useFetch<Product>(`/api/products/${route.params.id}`);

useHead(() => ({
  title: product.value
    ? `${product.value.name} | Chi Tiết Sản Phẩm`
    : 'Không tìm thấy sản phẩm | Shop điện tử 11',
}));

const quantity = ref(1);

// Đếm số lượng sản phẩm này đã có trong giỏ hàng
const itemInCartCount = computed(() => {
  if (!product.value) return 0;
  const targetId = Number(product.value.id);
  const found = cart.value.find((i) => Number(i.id) === targetId);
  return found ? found.quantity : 0;
});

// Số lượng còn có thể mua thêm = Tồn kho - Số lượng đã nằm trong giỏ
const availableToBuy = computed(() => {
  if (!product.value || !product.value.inStock) return 0;
  const stockLimit = product.value.stock ?? 99;
  return Math.max(0, stockLimit - itemInCartCount.value);
});

// Đảm bảo số lượng chọn mua luôn trong khoảng [1, availableToBuy]
watch(availableToBuy, (newAvailable) => {
  if (newAvailable <= 0) {
    quantity.value = 1;
  } else if (quantity.value > newAvailable) {
    quantity.value = newAvailable;
  }
});

const formatCategory = (cat: string) => {
  const map: Record<string, string> = {
    phone: 'Điện thoại',
    laptop: 'Laptop',
    audio: 'Âm thanh',
    accessory: 'Phụ kiện',
  };
  return map[cat] || cat;
};

const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = '/icon/placeholder.svg';
};

const handleAddToCart = () => {
  if (!product.value || !product.value.inStock || availableToBuy.value <= 0) return;

  addToCart(
    {
      id: Number(product.value.id),
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      stock: product.value.stock,
    },
    quantity.value
  );
};

const handleBuyNow = () => {
  if (!product.value || !product.value.inStock) return;
  if (availableToBuy.value <= 0) {
    navigateTo('/cart');
    return;
  }
  const added = addToCart(
    {
      id: Number(product.value.id),
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      stock: product.value.stock,
    },
    quantity.value
  );
  if (added) {
    navigateTo('/cart');
  }
};
</script>
