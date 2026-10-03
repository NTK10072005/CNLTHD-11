<!-- app/components/ProductCard.vue -->
<template>
  <div class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
 

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

      <!-- hiện 1 số thông số nổi bật sp (nếu có) -->
   
          <div class="mt-2 flex flex-wrap gap-1.5 min-h-[1.5rem]">
        <span 
          v-if="product.specs && Object.values(product.specs)[0]" 
          class="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 line-clamp-1"
          :title="Object.values(product.specs)[0]"
        >
          {{ Object.values(product.specs)[0] }}
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
          class="flex-shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
          :class="[
            !product.inStock
              ? 'cursor-not-allowed bg-slate-100 text-slate-400'
              : isJustAdded
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm'
          ]"
          @click.stop="handleAddToCart"
        >
          <span v-if="isJustAdded">✓ Đã thêm</span>
          <span v-else-if="!product.inStock">Hết hàng</span>
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

const isJustAdded = ref(false);

const formatCategory = (cat: string) => {
  const map: Record<string, string> = {
    phone: 'Điện thoại',
    laptop: 'Laptop',
    audio: 'Âm thanh',
    accessory: 'Phụ kiện',
  };
  return map[cat] || cat;
};

const handleAddToCart = () => {
  if (!props.product.inStock) return;

  addToCart({
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.image,
  });

  isJustAdded.value = true;
  setTimeout(() => {
    isJustAdded.value = false;
  }, 1200);
};
</script>
