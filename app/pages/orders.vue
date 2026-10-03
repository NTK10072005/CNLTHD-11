<template>
  <section class="mx-auto max-w-3xl" aria-labelledby="orders-title">
    <div class="border-b border-slate-200 pb-5">
      <p class="mb-2 text-xs font-extrabold text-[#078c91]">TÀI KHOẢN CỦA BẠN</p>
      <h1 id="orders-title" class="m-0 text-3xl font-extrabold text-[#142333]">Lịch sử đơn hàng</h1>
    </div>

    <div class="py-16 text-center">
      <p class="text-lg font-semibold text-[#213946]">Chưa có đơn hàng nào</p>
      <p class="mt-2 text-sm text-[#69758a]">Các đơn hàng của bạn sẽ hiển thị tại đây.</p>
      <NuxtLink class="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0caaa8] px-5 text-sm font-bold text-white no-underline hover:bg-[#078c91]" to="/products">
        Khám phá sản phẩm
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Lịch sử đơn hàng | Shop điện tử 11' })
</script>
