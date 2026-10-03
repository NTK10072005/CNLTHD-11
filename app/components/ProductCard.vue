<!-- app/components/ProductCard.vue -->
<template>
  <div class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <!-- Nhãn hết hàng nếu không còn tồn kho -->
    <div v-if="!product.inStock" class="absolute left-3 top-3 z-10">
      <span class="rounded-md bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
        Hết hàng
      </span>
    </div>

    <!-- Ảnh sản phẩm -->
    <NuxtLink :to="`/products/${product.id}`" class="relative block h-52 w-full overflow-hidden bg-slate-100">
      <img
        :src="product.image"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="onImageError"
      />
    </NuxtLink>

    <!-- Nội dung thẻ -->
    <div class="flex flex-1 flex-col p-4">
      <!-- Danh mục -->
      <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
        {{ formatCategory(product.category) }}
      </div>

      <!-- Tên sản phẩm -->
      <NuxtLink
        :to="`/products/${product.id}`"
        class="line-clamp-2 text-sm font-bold text-slate-800 transition-colors hover:text-blue-600"
        :title="product.name"
      >
        {{ product.name }}
      </NuxtLink>

      <!-- Thông số nổi bật đầu tiên (nếu có) -->
      <div class="mt-2 min-h-[1.5rem] flex flex-wrap gap-1.5">
        <span
          v-if="firstSpec"
          class="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 line-clamp-1"
          :title="firstSpec"
        >
          {{ firstSpec }}
        </span>
      </div>

      <!-- Giá và Nút thêm vào giỏ -->
      <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div class="min-w-0 flex-1">
          <span class="block truncate text-base font-extrabold text-slate-900">
            {{ formatPrice(product.price) }}
          </span>
        </div>

        <button
          type="button"
          :disabled="!product.inStock"
          class="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
          :class="[
            !product.inStock
              ? 'cursor-not-allowed bg-slate-100 text-slate-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          ]"
          @click.stop="handleAddToCart"
        >
          <img v-if="product.inStock" src="/icon/cart-white.svg" alt="Giỏ hàng" class="h-3.5 w-3.5" />
          <span v-if="!product.inStock">Hết hàng</span>
          <span v-else>+ Giỏ hàng</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

const props = defineProps<{
  product: Product;
}>();

const { formatPrice } = useFormatPrice();
const { addToCart } = useCart();

// Lấy thông số kỹ thuật đầu tiên để hiển thị rút gọn trên thẻ
const firstSpec = computed(() => {
  if (!props.product.specs) return '';
  const values = Object.values(props.product.specs);
  return values.length > 0 ? values[0] : '';
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
  if (!props.product.inStock) return;

  addToCart({
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.image,
  });
};
</script>
