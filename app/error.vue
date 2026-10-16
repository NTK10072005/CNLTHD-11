<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const isNotFound = computed(() => props.error.statusCode === 404);
const title = computed(() => isNotFound.value ? 'Không tìm thấy trang' : 'Đã xảy ra sự cố');

useSeoMeta({
  title: () => `${title.value} | Shop điện tử 11`,
  robots: 'noindex, nofollow',
});

async function recover(path: string) {
  await clearError({ redirect: path });
}
</script>

<template>
  <!-- Trang lỗi độc lập để vẫn hiển thị khi layout hoặc khôi phục session lỗi. -->
  <main class="grid min-h-screen place-items-center bg-slate-50 px-4 py-12">
    <section class="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm" aria-labelledby="error-title">
      <p class="text-xs font-extrabold text-teal-700">SHOP ĐIỆN TỬ 11</p>
      <p class="mt-5 text-5xl font-black text-slate-800">{{ error.statusCode || 500 }}</p>
      <h1 id="error-title" class="mt-4 text-2xl font-extrabold text-slate-900">{{ title }}</h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        {{ isNotFound ? 'Đường dẫn không tồn tại hoặc nội dung đã được chuyển đi.' : 'Ứng dụng chưa thể xử lý yêu cầu. Vui lòng thử lại sau.' }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/products" class="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800" @click.prevent="recover('/products')">Xem danh mục</a>
        <a href="/" class="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click.prevent="recover('/')">Về trang chủ</a>
      </div>
    </section>
  </main>
</template>

