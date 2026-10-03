<!-- app/error.vue -->
<template>
  <NuxtLayout>
    <div class="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div class="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm">
        <img src="/icon/search.svg" alt="Error" class="h-10 w-10 opacity-70" />
      </div>

   
      <h1 class="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
        {{ is404 ? 'Không tìm thấy trang hoặc sản phẩm' : 'Đã có lỗi xảy ra' }}
      </h1>

      <p class="mt-2 max-w-md text-xs leading-relaxed text-slate-500">
        {{ error?.statusMessage || 'Sản phẩm hoặc đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.' }}
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          @click="handleClearError"
        >
          ← Quay lại danh mục sản phẩm
        </button>

        <NuxtLink
          to="/"
          class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Về trang chủ
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

const is404 = computed(() => props.error?.statusCode === 404);

useSeoMeta({
  title: () => `Lỗi ${props.error?.statusCode || 404} | Shop Điện Tử`,
});

const handleClearError = () => {
  clearError({ redirect: '/products' });
};
</script>
