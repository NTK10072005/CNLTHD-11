<script setup lang="ts">
import type { Order } from "~/types/order";

definePageMeta({
  middleware: "auth",
});

useHead({
  title: "Lịch sử đơn hàng | Shop điện tử 11",
});

const { user } = useAuth();

const {
  data: orders,
  status,
  error,
  refresh,
} = await useFetch<Order[]>("/api/orders", {
  query: {
    userId: user.value?.id,
  },

  default: () => [],
});

async function handleRefresh() {
  await refresh();
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-10">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Lịch sử đơn hàng</h1>

        <p class="mt-2 text-slate-500">Theo dõi các đơn hàng bạn đã đặt.</p>
      </div>

      <button
        type="button"
        class="rounded-lg border px-4 py-2"
        @click="handleRefresh"
      >
        Làm mới
      </button>
    </div>

    <div v-if="status === 'pending'" class="py-12 text-center">
      Đang tải đơn hàng...
    </div>

    <div v-else-if="error" class="rounded-lg bg-red-50 p-5 text-red-700">
      Không thể tải lịch sử đơn hàng.
    </div>

    <div
      v-else-if="orders.length === 0"
      class="rounded-xl bg-white p-12 text-center shadow"
    >
      <p class="mb-4 text-slate-500">Bạn chưa có đơn hàng nào.</p>

      <NuxtLink to="/products" class="font-semibold text-teal-600">
        Mua sắm ngay
      </NuxtLink>
    </div>

    <div v-else class="overflow-hidden rounded-xl bg-white shadow">
      <table class="w-full">
        <thead class="bg-slate-100">
          <tr>
            <th class="p-4 text-left">Mã đơn</th>

            <th class="p-4 text-left">Ngày đặt</th>

            <th class="p-4 text-left">Tổng tiền</th>

            <th class="p-4 text-left">Trạng thái</th>

            <th class="p-4"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="order in orders" :key="order.id" class="border-t">
            <td class="p-4 font-semibold">#{{ order.id }}</td>

            <td class="p-4">
              {{ new Date(order.createdAt).toLocaleString("vi-VN") }}
            </td>

            <td class="p-4">{{ order.total.toLocaleString("vi-VN") }} ₫</td>

            <td class="p-4">
              {{ order.status }}
            </td>

            <td class="p-4 text-right">
              <NuxtLink
                :to="`/orders/${order.id}`"
                class="font-semibold text-teal-600"
              >
                Xem chi tiết
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
