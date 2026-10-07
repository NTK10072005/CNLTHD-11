<!-- app/pages/products/index.vue -->
<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <!-- Breadcrumb điều hướng -->
    <nav class="mb-4 flex items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="transition hover:text-blue-600">Trang chủ</NuxtLink>
      <span>/</span>
      <span class="font-medium text-slate-800">Danh mục sản phẩm</span>
    </nav>

    <!-- Header Trang & Thanh tìm kiếm và sắp xếp -->
    <div class="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {{ categoryTitle }}
        </h1>
        <p class="mt-1 text-xs text-slate-500">
          Tìm thấy <span class="font-bold text-blue-600">{{ filteredProducts.length }}</span> sản phẩm phù hợp
        </p>
      </div>

      <!-- Ô tìm kiếm & Sắp xếp -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative w-full sm:w-64">
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
            ✕
          </button>
        </div>

        <select
          v-model="sortBy"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="default">Sắp xếp: Mặc định</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
          <option value="name">Tên: A - Z</option>
        </select>
      </div>
    </div>

    <!-- Khung chính chia 2 cột -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
      
      <!-- CỘT TRÁI: SIDEBAR BỘ LỌC  -->
      <ProductFilterSidebar
        v-model:category="selectedCategory"
        v-model:price-range="selectedPriceRange"
        v-model:in-stock="onlyInStock"
        :products="products || []"
        :categories="categories"
        :price-ranges="priceRanges"
        :has-active-filters="hasActiveFilters"
        @reset="resetFilters"
      />

      <!-- CỘT PHẢI: LƯỚI SẢN PHẨM & TRẠNG THÁI -->
      <main class="lg:col-span-3">
        
        <!-- Các chip tag đang lọc (Active Filter Chips) -->
        <div v-if="hasActiveFilters" class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-slate-400">Đang lọc:</span>
          
          <span v-if="selectedCategory !== 'all'" class="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {{ formatCategoryLabel(selectedCategory) }}
            <button type="button" class="hover:text-blue-900" @click="selectedCategory = 'all'">✕</button>
          </span>

          <span v-if="selectedPriceRange !== 'all'" class="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {{ formatPriceRangeLabel(selectedPriceRange) }}
            <button type="button" class="hover:text-blue-900" @click="selectedPriceRange = 'all'">✕</button>
          </span>

          <span v-if="onlyInStock" class="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Còn hàng
            <button type="button" class="hover:text-emerald-900" @click="onlyInStock = false">✕</button>
          </span>

          <span v-if="searchQuery" class="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            "{{ searchQuery }}"
            <button type="button" class="hover:text-amber-900" @click="searchQuery = ''">✕</button>
          </span>
        </div>

        <!-- Trạng thái Loading Skeleton -->
        <div v-if="status === 'pending'" key="state-loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="n in 6" :key="n" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
            <div class="h-48 w-full rounded-xl bg-slate-200"></div>
            <div class="mt-4 h-4 w-3/4 rounded bg-slate-200"></div>
            <div class="mt-2 h-3 w-1/2 rounded bg-slate-200"></div>
            <div class="mt-6 flex justify-between">
              <div class="h-5 w-24 rounded bg-slate-200"></div>
              <div class="h-7 w-20 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>

        <!--  Trạng thái Lỗi -->
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

        <!-- Thành công: Có sản phẩm để hiển thị -->
        <div v-else-if="filteredProducts.length > 0" key="state-success">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Thanh phân trang (Pagination Bar) -->
          <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              :disabled="currentPage === 1"
              class="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              @click="goToPage(currentPage - 1)"
            >
              ← Trước
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              class="h-9 w-9 rounded-xl text-xs font-bold shadow-sm transition"
              :class="[
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>

            <button
              type="button"
              :disabled="currentPage === totalPages"
              class="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              @click="goToPage(currentPage + 1)"
            >
              Sau →
            </button>
          </div>
        </div>

        <!-- Không tìm thấy sản phẩm nào phù hợp (Empty State) -->
        <div v-else key="state-empty" class="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
            <img src="/icon/search.svg" alt="Tìm kiếm" class="h-6 w-6" />
          </div>
          <p class="text-base font-bold text-slate-800">Không tìm thấy sản phẩm nào</p>
          <p class="mt-1 text-xs text-slate-500">Hãy thử đổi khoảng giá hoặc từ khóa tìm kiếm khác nhé.</p>
          <button
            type="button"
            class="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            @click="resetFilters"
          >
            Xóa bộ lọc & Xem tất cả
          </button>
        </div>

      </main>
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
</template>

<script setup lang="ts">
import type { Product } from '~/types/product';

const route = useRoute()
const { cartToast } = useCart()
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


// Danh mục và khoảng giá định nghĩa chuẩn
const categories = [
  { label: 'Tất cả sản phẩm', value: 'all' },
  { label: 'Điện thoại', value: 'phone' },
  { label: 'Laptop', value: 'laptop' },
  { label: 'Âm thanh', value: 'audio' },
  { label: 'Phụ kiện', value: 'accessory' },
];

const priceRanges = [
  { label: 'Tất cả mức giá', value: 'all' },
  { label: 'Dưới 5 triệu', value: 'under-5m' },
  { label: 'Từ 5 - 15 triệu', value: '5m-15m' },
  { label: 'Từ 15 - 30 triệu', value: '15m-30m' },
  { label: 'Trên 30 triệu', value: 'above-30m' },
];

// Khởi tạo State từ Query URL khi tải trang
const selectedCategory = ref((route.query.category as string) || 'all');
const selectedPriceRange = ref((route.query.price as string) || 'all');
const onlyInStock = ref(route.query.inStock === 'true');
const searchQuery = ref(initialSearch);
const sortBy = ref((route.query.sort as string) || 'default');

// Phân trang: 6 sản phẩm mỗi trang
const currentPage = ref(1);
const itemsPerPage = ref(6);

// Tiêu đề danh mục động
const categoryTitle = computed(() => {
  const found = categories.find((c) => c.value === selectedCategory.value);
  return found && found.value !== 'all' ? `Danh mục: ${found.label}` : 'Tất Cả Sản Phẩm Công Nghệ';
});

// Helper hiển thị nhãn chip lọc
const formatCategoryLabel = (catVal: string) => {
  return categories.find((c) => c.value === catVal)?.label || catVal;
};

const formatPriceRangeLabel = (rangeVal: string) => {
  return priceRanges.find((r) => r.value === rangeVal)?.label || rangeVal;
};

// Kiểm tra có đang áp dụng bộ lọc nào không
const hasActiveFilters = computed(() => {
  return (
    selectedCategory.value !== 'all' ||
    selectedPriceRange.value !== 'all' ||
    onlyInStock.value ||
    searchQuery.value.trim().length > 0
  );
});

const filteredProducts = computed(() => {
  if (!products.value) return [];

  const query = searchQuery.value.toLowerCase().trim();

  const list = products.value.filter((p) => {
    // Lọc Danh mục
    if (selectedCategory.value !== 'all' && p.category !== selectedCategory.value) return false;
    
    // Lọc Chỉ còn hàng
    if (onlyInStock.value && !p.inStock) return false;
    
    // Lọc Tìm kiếm từ khóa
    if (query && !p.name.toLowerCase().includes(query)) return false;
    
    // Lọc Khoảng giá
    if (selectedPriceRange.value === 'under-5m' && p.price >= 5000000) return false;
    if (selectedPriceRange.value === '5m-15m' && (p.price < 5000000 || p.price > 15000000)) return false;
    if (selectedPriceRange.value === '15m-30m' && (p.price <= 15000000 || p.price > 30000000)) return false;
    if (selectedPriceRange.value === 'above-30m' && p.price <= 30000000) return false;

    return true; 
  });

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

// Phân trang
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value) || 1);

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredProducts.value.slice(start, start + itemsPerPage.value);
});

const goToPage = (page: number) => {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value));
  window.scrollTo({ top: 150, behavior: 'smooth' });
};

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
  selectedPriceRange.value = 'all';
  onlyInStock.value = false;
  searchQuery.value = '';
  clearHeaderSearch();
  sortBy.value = 'default';
};
</script>
