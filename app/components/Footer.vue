<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto min-h-[220px] bg-gradient-to-r from-[#071b2b] via-[#0c2a3c] to-[#103c4b] text-[#e7f4f5]">
    <div class="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
      <div class="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-12">
        <section>
          <NuxtLink class="text-lg font-extrabold text-white no-underline hover:text-[#62e1dc]" to="/">
            Shop điện tử 11
          </NuxtLink>
          <p class="mt-3 max-w-sm text-sm leading-6 text-[#b9cbd0]">
            Điện thoại, máy tính và phụ kiện công nghệ cho nhu cầu học tập, làm việc và giải trí.
          </p>
        </section>

        <nav aria-label="Liên kết cửa hàng">
          <h2 class="m-0 text-sm font-bold text-white">Cửa hàng</h2>
          <ul class="mt-4 grid gap-3 p-0 text-sm text-[#b9cbd0]">
            <li class="list-none"><NuxtLink class="text-inherit no-underline hover:text-[#62e1dc]" to="/">Trang chủ</NuxtLink></li>
            <li class="list-none"><NuxtLink class="text-inherit no-underline hover:text-[#62e1dc]" to="/products">Danh mục sản phẩm</NuxtLink></li>
          </ul>
        </nav>

        <nav aria-label="Liên kết tài khoản">
          <h2 class="m-0 text-sm font-bold text-white">Tài khoản</h2>
          <ul class="mt-4 grid gap-3 p-0 text-sm text-[#b9cbd0]">
            <li class="list-none"><NuxtLink class="text-inherit no-underline hover:text-[#62e1dc]" to="/login">Đăng nhập</NuxtLink></li>
            <li class="list-none"><NuxtLink class="text-inherit no-underline hover:text-[#62e1dc]" to="/register">Tạo tài khoản</NuxtLink></li>
            <li class="list-none"><NuxtLink class="text-inherit no-underline hover:text-[#62e1dc]" to="/orders">Lịch sử đơn hàng</NuxtLink></li>
          </ul>
        </nav>

        <section>
          <h2 class="m-0 text-sm font-bold text-white">Liên hệ hỗ trợ</h2>
          <a class="mt-4 inline-block text-sm text-[#b9cbd0] underline decoration-[#46d7d0]/60 underline-offset-4 transition hover:text-[#62e1dc]" href="mailto:shopdientu11@gmail.com">
            shopdientu11@gmail.com
          </a>
        </section>
      </div>

      <div class="mt-9 border-t border-white/15 pt-5 text-xs text-[#a9bec4]">
        © {{ currentYear }} Shop điện tử 11. Bản quyền thuộc về cửa hàng.
      </div>
    </div>
  </footer>
</template>
