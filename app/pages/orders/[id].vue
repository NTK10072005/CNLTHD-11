<script setup lang="ts">
import type { Order } from "~/types/order";
import { formatOrderDate } from "~/utils/orderDate";
import { orderErrorMessage, canRetryOrder, requestErrorStatus } from "~/utils/requestError";

definePageMeta({
  middleware: "auth",
  validate: (route) => /^\d+$/.test(String(route.params.id)) &&
    Number.isSafeInteger(Number(route.params.id)) && Number(route.params.id) > 0,
});

const route = useRoute();
const requestFetch = useRequestFetch();

const {
  data: order,
  status,
  error,
  refresh,
} = await useAsyncData<Order>(() => `order:${Number(route.params.id)}`, () =>
  requestFetch<Order>(`/api/orders/${route.params.id}`),
);

if (import.meta.server && error.value) {
  const event = useRequestEvent();
  if (event) setResponseStatus(event, requestErrorStatus(error.value) || 503);
}

useSeoMeta({ robots: "noindex, nofollow" });

useHead(() => ({
  title: order.value
    ? `Đơn hàng #${order.value.id} | Shop điện tử 11`
    : "Chi tiết đơn hàng | Shop điện tử 11",
}));
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-10">
    <div v-if="status === 'pending'" role="status" class="py-12 text-center">
      Đang tải đơn hàng...
    </div>

    <div
      v-else-if="error"
      role="alert"
      class="rounded-xl bg-red-50 p-8 text-center text-red-700"
    >
      <p>{{ orderErrorMessage(error) }}</p>
      <NuxtLink v-if="requestErrorStatus(error) === 401" to="/login" class="mt-3 inline-block font-semibold underline">Đăng nhập lại</NuxtLink>
      <button v-else-if="canRetryOrder(error)" type="button" class="mt-3 font-semibold underline" @click="refresh()">Thử lại</button>
      <NuxtLink to="/orders" class="mt-4 block font-semibold underline">Về lịch sử đơn hàng</NuxtLink>
    </div>

    <div v-else-if="order" class="space-y-6">
      <div>
        <NuxtLink to="/orders" class="text-sm font-semibold text-teal-600">
          ← Lịch sử đơn hàng
        </NuxtLink>

        <h1 class="mt-3 text-3xl font-bold">Đơn hàng #{{ order.id }}</h1>

        <p class="mt-2 text-slate-500">
          {{ formatOrderDate(order.createdAt) }}
        </p>
      </div>

      <section class="rounded-xl bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-bold">Thông tin nhận hàng</h2>

        <div class="space-y-2 text-slate-700">
          <p>
            <strong>Người nhận:</strong>
            {{ order.shippingInfo.name }}
          </p>

          <p>
            <strong>Số điện thoại:</strong>
            {{ order.shippingInfo.phone }}
          </p>

          <p>
            <strong>Địa chỉ:</strong>
            {{ order.shippingInfo.address }}
          </p>

          <p v-if="order.shippingInfo.note">
            <strong>Ghi chú:</strong>
            {{ order.shippingInfo.note }}
          </p>
        </div>
      </section>

      <section class="rounded-xl bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-bold">Sản phẩm</h2>

        <div class="space-y-4">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex gap-4 border-b pb-4 last:border-0"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="h-20 w-20 rounded-lg object-cover"
            />

            <div class="flex-1">
              <p class="font-semibold">
                {{ item.name }}
              </p>

              <p class="text-sm text-slate-500">
                Số lượng: {{ item.quantity }}
              </p>

              <p class="mt-1">{{ item.price.toLocaleString("vi-VN") }} ₫</p>
            </div>

            <div class="font-semibold">
              {{ (item.price * item.quantity).toLocaleString("vi-VN") }}
              ₫
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-xl bg-white p-6 shadow">
        <div class="space-y-3">
          <div class="flex justify-between">
            <span>Thanh toán</span>

            <strong>COD</strong>
          </div>

          <div class="flex justify-between">
            <span>Trạng thái</span>

            <strong>
              {{ order.status }}
            </strong>
          </div>

          <div class="flex justify-between border-t pt-4 text-xl">
            <span class="font-bold"> Tổng cộng </span>

            <strong> {{ order.total.toLocaleString("vi-VN") }} ₫ </strong>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
