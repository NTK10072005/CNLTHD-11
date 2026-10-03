<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Tiêu đề trang -->
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Khám Phá Thiết Bị Công Nghệ
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        Danh sách điện thoại, laptop, thiết bị âm thanh và phụ kiện chính hãng chất lượng cao.
      </p>
    </div>

    <!-- Thanh công cụ: Lọc danh mục, tìm kiếm và sắp xếp -->
    <div class="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <!-- Tabs Danh mục -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.value"
          type="button"
          class="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
          :class="[
            selectedCategory === cat.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
          ]"
          @click="selectedCategory = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Ô tìm kiếm & Sắp xếp -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <!-- Tìm kiếm -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-8 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-60"
            @input="clearHeaderSearch"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            @click="searchQuery = ''; clearHeaderSearch()"
          >
            X 
          </button>
        </div>

        <!-- Sắp xếp giá -->
        <select
          v-model="sortBy"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="default">Mặc định</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
          <option value="name">Tên: A - Z</option>
        </select>
      </div>
    </div>

   


       <!-- 1. Trạng thái Loading Skeleton -->
    <div v-if="status === 'pending'" key="state-loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div v-for="n in 8" :key="n" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
        <div class="h-48 w-full rounded-xl bg-slate-200"></div>
        <div class="mt-4 h-4 w-3/4 rounded bg-slate-200"></div>
        <div class="mt-2 h-3 w-1/2 rounded bg-slate-200"></div>
        <div class="mt-6 flex justify-between">
          <div class="h-5 w-24 rounded bg-slate-200"></div>
          <div class="h-7 w-20 rounded bg-slate-200"></div>
        </div>
      </div>
    </div>
    <!-- 2. Trạng thái Lỗi -->
    <div v-else-if="error" key="state-error" class="rounded-2xl border border-rose-200 bg-rose-50/50 p-12 text-center">
      <p class="text-sm font-semibold text-rose-600">Đã xảy ra lỗi khi tải danh sách sản phẩm.</p>
      <button
        type="button"
        class="mt-4 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
        @click="() => refresh()"
      >
        Tải lại trang
      </button>
    </div>
    <!-- 3. Thành công: Có sản phẩm để hiển thị -->

    <div v-else-if ="filteredProducts.length > 0" key="state-success" class="space-y-4">
      <div class="text-xs font-medium text-slate-500">
        Hiển thị <span class="font-bold text-slate-800">{{ filteredProducts.length }}</span> sản phẩm
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
    <!-- 4. Không tìm thấy sản phẩm nào phù hợp (Empty State) -->
    <div v-else key="state-empty" class="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
      <p class="text-base font-semibold text-slate-700">Không tìm thấy sản phẩm nào phù hợp</p>
      <p class="mt-1 text-xs text-slate-500">Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác nhé.</p>
      <button
        type="button"
        class="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        @click="resetFilters"
      >
        Đặt lại bộ lọc
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

const route = useRoute()
const initialSearch = typeof route.query.search === 'string' ? route.query.search : ''
const headerSearchTerm = ref(initialSearch)

// SEO Meta
useSeoMeta({
  title: 'Danh Sách Sản Phẩm | Cửa hàng bán máy tính và đồ điện tử',
  description: 'Khám phá điện thoại, laptop, thiết bị âm thanh và phụ kiện công nghệ hàng đầu.',
});

// useFetch chuẩn SSR với cơ chế tự kiểm tra tính hợp lệ của Cache (tránh mismatch khi bật SWR)
const { data: products, status, error, refresh } = await useFetch<Product[]>('/api/products', {
  key: 'products-list',
  default: () => [],
  getCachedData(key, nuxtApp) {
    const data = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return undefined; // Bỏ qua cache nếu data không phải là mảng sản phẩm hợp lệ
  },
});


const categories = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Điện thoại', value: 'phone' },
  { label: 'Laptop', value: 'laptop' },
  { label: 'Âm thanh', value: 'audio' },
  { label: 'Phụ kiện', value: 'accessory' },
];

const selectedCategory = ref('all');
const searchQuery = ref(initialSearch);
const sortBy = ref('default');

const filteredProducts = computed(() => {
  if (!products.value || !Array.isArray(products.value)) return [];

  let list = [...products.value];

  // Lọc theo category
  if (selectedCategory.value !== 'all') {
    list = list.filter((p) => p.category === selectedCategory.value);
  }

  // Lọc theo search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }

  // Sắp xếp
  if (sortBy.value === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
});

watch(() => route.query.search, (value) => {
  const query = typeof value === 'string' ? value : ''
  searchQuery.value = query
  headerSearchTerm.value = query
});

watch([status, filteredProducts], ([currentStatus, matches]) => {
  if (currentStatus === 'success' && headerSearchTerm.value.trim() && matches.length === 0) {
    navigateTo({ path: '/error', query: { search: headerSearchTerm.value } })
  }
});

if (initialSearch && status.value === 'success' && filteredProducts.value.length === 0) {
  await navigateTo({ path: '/error', query: { search: initialSearch } })
}

function clearHeaderSearch() {
  headerSearchTerm.value = ''
}

const resetFilters = () => {
  selectedCategory.value = 'all';
  searchQuery.value = '';
  clearHeaderSearch();
  sortBy.value = 'default';
};
</script>
