<template>
	<section class="mx-auto grid min-h-[55vh] max-w-2xl content-center justify-items-center px-4 py-12 text-center" aria-labelledby="error-title">
		<p class="mb-3 text-xs font-extrabold text-[#078c91]">SHOP ĐIỆN TỬ 11</p>
		<h1 id="error-title" class="m-0 text-3xl font-extrabold text-[#142333]">Không tìm thấy sản phẩm</h1>
		<p class="mt-3 max-w-lg text-sm leading-6 text-[#69758a]">
			<template v-if="searchTerm">Không có sản phẩm phù hợp với từ khóa “{{ searchTerm }}”.</template>
			<template v-else>Không thể tìm thấy nội dung bạn đang cần.</template>
		</p>
		<div class="mt-7 flex flex-wrap justify-center gap-3">
			<NuxtLink class="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0caaa8] px-5 text-sm font-bold text-white no-underline hover:bg-[#078c91]" to="/products">
				Xem danh mục
			</NuxtLink>
			<NuxtLink class="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-[#213946] no-underline hover:bg-slate-50" to="/">
				Về trang chủ
			</NuxtLink>
		</div>
	</section>
</template>

<script setup lang="ts">
const route = useRoute()
const searchTerm = computed(() => typeof route.query.search === 'string' ? route.query.search : '')

useSeoMeta({ title: 'Không tìm thấy sản phẩm | Shop điện tử 11' })
</script>
