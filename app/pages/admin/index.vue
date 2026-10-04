<script setup lang="ts">
import type { Order } from "~/types/order";
import type { Product } from "~/types/product";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useHead({
  title: "Admin Dashboard | Shop điện tử 11",
});

const {
  data: products,
  status: productStatus,
  error: productError,
} = await useFetch<Product[]>("/api/products", {
  default: () => [],
});

const {
  data: orders,
  status: orderStatus,
  error: orderError,
} = await useFetch<Order[]>("/api/orders", {
  default: () => [],
});

const pendingOrders = computed(() => {
  return orders.value.filter((order) => order.status === "pending").length;
});

const totalRevenue = computed(() => {
  return orders.value
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + order.total, 0);
});

const isLoading = computed(() => {
  return productStatus.value === "pending" || orderStatus.value === "pending";
});

const hasError = computed(() => {
  return !!productError.value || !!orderError.value;
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Tổng quan</h1>

      <p class="mt-2 text-slate-500">Dashboard quản trị hệ thống.</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="rounded-xl bg-white p-8 text-center shadow">
      Đang tải dữ liệu...
    </div>

    <!-- Error -->
    <div v-else-if="hasError" class="rounded-xl bg-red-50 p-6 text-red-700">
      Không thể tải dữ liệu Dashboard.
    </div>

    <!-- Dashboard -->
    <div v-else>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <!-- Products -->
        <article class="rounded-xl bg-white p-6 shadow">
          <p class="text-sm font-medium text-slate-500">Sản phẩm</p>

          <p class="mt-2 text-3xl font-bold text-slate-900">
            {{ products.length }}
          </p>

          <NuxtLink
            to="/admin/products"
            class="mt-4 inline-block text-sm font-semibold text-teal-600"
          >
            Quản lý sản phẩm →
          </NuxtLink>
        </article>

        <!-- Orders -->
        <article class="rounded-xl bg-white p-6 shadow">
          <p class="text-sm font-medium text-slate-500">Tổng đơn hàng</p>

          <p class="mt-2 text-3xl font-bold text-slate-900">
            {{ orders.length }}
          </p>

          <NuxtLink
            to="/admin/orders"
            class="mt-4 inline-block text-sm font-semibold text-teal-600"
          >
            Xem đơn hàng →
          </NuxtLink>
        </article>

        <!-- Pending orders -->
        <article class="rounded-xl bg-white p-6 shadow">
          <p class="text-sm font-medium text-slate-500">Đơn đang chờ</p>

          <p class="mt-2 text-3xl font-bold text-slate-900">
            {{ pendingOrders }}
          </p>

          <NuxtLink
            to="/admin/orders"
            class="mt-4 inline-block text-sm font-semibold text-teal-600"
          >
            Xử lý đơn →
          </NuxtLink>
        </article>

        <!-- Revenue -->
        <article class="rounded-xl bg-white p-6 shadow">
          <p class="text-sm font-medium text-slate-500">Tổng giá trị đơn</p>

          <p class="mt-2 text-2xl font-bold text-slate-900">
            {{ totalRevenue.toLocaleString("vi-VN") }} ₫
          </p>

          <p class="mt-4 text-sm text-slate-400">Không tính đơn đã huỷ</p>
        </article>
      </div>

      <!-- Quick actions -->
      <section class="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 class="mb-5 text-xl font-bold text-slate-900">Truy cập nhanh</h2>

        <div class="flex flex-wrap gap-4">
          <NuxtLink
            to="/admin/products"
            class="rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
          >
            Quản lý sản phẩm
          </NuxtLink>

          <NuxtLink
            to="/admin/products/create"
            class="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Thêm sản phẩm
          </NuxtLink>

          <NuxtLink
            to="/admin/orders"
            class="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Quản lý đơn hàng
          </NuxtLink>

          <NuxtLink
            to="/admin/users"
            class="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Khách hàng
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
