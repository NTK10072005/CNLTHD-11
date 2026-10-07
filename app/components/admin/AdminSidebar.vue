<script setup lang="ts">
const { user, logout } = useAuth();

async function handleLogout() {
  logout();
  await navigateTo("/login");
}

const menuItems = [
  {
    label: "Tổng quan",
    to: "/admin",
  },
  {
    label: "Sản phẩm",
    to: "/admin/products",
  },
  {
    label: "Đơn hàng",
    to: "/admin/orders",
  },
  {
    label: "Khách hàng",
    to: "/admin/users",
  },
];
</script>

<template>
  <aside class="flex w-64 flex-col bg-slate-900 text-white">
    <div class="border-b border-slate-700 p-6">
      <NuxtLink to="/admin" class="text-xl font-bold">
        TechStore Admin
      </NuxtLink>

      <p class="mt-2 text-sm text-slate-400">
        {{ user?.name }}
      </p>
    </div>

    <nav class="flex-1 space-y-2 p-4">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-slate-800"
        active-class="bg-teal-600 hover:bg-teal-600"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="border-t border-slate-700 p-4">
      <button
        type="button"
        class="w-full rounded-lg bg-slate-800 px-4 py-3 text-left hover:bg-slate-700"
        @click="handleLogout"
      >
        Đăng xuất
      </button>
    </div>
  </aside>
</template>
