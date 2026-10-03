<!-- app/components/ProductFilterSidebar.vue -->
<template>
  <aside class="lg:col-span-1">
    <div class="sticky top-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <!-- Tiêu đề sidebar & nút xóa bộ lọc -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 class="flex items-center gap-2 text-sm font-bold text-slate-900">
          <img src="/icon/filter.svg" alt="Filter" class="h-4 w-4" />
          <span>Bộ Lọc Tìm Kiếm</span>
        </h2>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="text-xs font-semibold text-rose-600 hover:underline"
          @click="$emit('reset')"
        >
          Xóa tất cả
        </button>
      </div>

      <!-- Lọc theo Danh mục -->
      <div>
        <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Danh mục sản phẩm</h3>
        <div class="space-y-1.5">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition"
            :class="[
              categoryModel === cat.value
                ? 'bg-blue-50 font-bold text-blue-600 shadow-sm'
                : 'text-slate-700 hover:bg-slate-50'
            ]"
            @click="categoryModel = cat.value"
          >
            <span>{{ cat.label }}</span>
            <span
              class="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
              :class="{ 'bg-blue-100 text-blue-700': categoryModel === cat.value }"
            >
              {{ getCountByCategory(cat.value) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Lọc theo Mức giá -->
      <div class="border-t border-slate-100 pt-5">
        <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mức giá</h3>
        <div class="space-y-2">
          <label
            v-for="price in priceRanges"
            :key="price.value"
            class="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700 hover:text-blue-600"
          >
            <input
              v-model="priceRangeModel"
              type="radio"
              name="sidebar-price-range"
              :value="price.value"
              class="h-4 w-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{{ price.label }}</span>
          </label>
        </div>
      </div>

      <!-- Lọc theo Tình trạng kho -->
      <div class="border-t border-slate-100 pt-5">
        <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tình trạng hàng</h3>
        <label class="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700 hover:text-blue-600">
          <input
            v-model="inStockModel"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Chỉ hiện sản phẩm còn hàng</span>
        </label>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

const categoryModel = defineModel<string>('category', { default: 'all' });
const priceRangeModel = defineModel<string>('priceRange', { default: 'all' });
const inStockModel = defineModel<boolean>('inStock', { default: false });

const props = withDefaults(
  defineProps<{
    products?: Product[];
    hasActiveFilters?: boolean;
    categories?: Array<{ label: string; value: string }>;
    priceRanges?: Array<{ label: string; value: string }>;
  }>(),
  {
    products: () => [],
    hasActiveFilters: false,
    categories: () => [
      { label: 'Tất cả sản phẩm', value: 'all' },
      { label: 'Điện thoại', value: 'phone' },
      { label: 'Laptop', value: 'laptop' },
      { label: 'Âm thanh', value: 'audio' },
      { label: 'Phụ kiện', value: 'accessory' },
    ],
    priceRanges: () => [
      { label: 'Tất cả mức giá', value: 'all' },
      { label: 'Dưới 5 triệu', value: 'under-5m' },
      { label: 'Từ 5 - 15 triệu', value: '5m-15m' },
      { label: 'Từ 15 - 30 triệu', value: '15m-30m' },
      { label: 'Trên 30 triệu', value: 'above-30m' },
    ],
  }
);

defineEmits<{
  (e: 'reset'): void;
}>();

const getCountByCategory = (cat: string) => {
  if (!props.products || !Array.isArray(props.products)) return 0;
  if (cat === 'all') return props.products.length;
  return props.products.filter((p) => p.category === cat).length;
};
</script>
