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
const { user } = useAuth();
const { refreshOrders, refreshProducts } = useShopData();
const isCancelling = ref(false);
const cancelError = ref("");
const cancelSuccess = ref("");

const {
  data: order,
  status,
  error,
  refresh,
} = await useAsyncData<Order>(() => `order:${Number(route.params.id)}`, () =>
  requestFetch<Order>(`/api/orders/${route.params.id}`),
);

const canCancel = computed(() => order.value?.userId === user.value?.id &&
  order.value?.status === "pending");

async function cancelOrder() {
  if (!order.value || !canCancel.value || isCancelling.value) return;
  if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng #${order.value.id}?`)) return;
  const currentOrder = order.value;
  isCancelling.value = true;
  cancelError.value = "";
  cancelSuccess.value = "";
  try {
    const response = await $fetch<{ order: Order }>(`/api/orders/${currentOrder.id}/cancel`, {
      method: "POST", body: {},
    });
    // Cập nhật ngay sau khi API thành công, kể cả khi làm mới dữ liệu gặp lỗi.
    order.value = response.order;
    cancelSuccess.value = "Đã hủy đơn hàng thành công.";
    const results = await Promise.allSettled([
      refreshOrders(currentOrder.id),
      refreshProducts(currentOrder.items.map((item) => item.id)),
    ]);
    if (results.some((result) => result.status === "rejected")) {
      cancelError.value = "Đơn đã được hủy, nhưng chưa thể làm mới đầy đủ dữ liệu. Vui lòng tải lại trang.";
    }
  } catch (cause: unknown) {
    const code = requestErrorStatus(cause);
    cancelError.value = code === 401 ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
      : code === 403 ? "Bạn không có quyền hủy đơn hàng này."
      : code === 409 ? "Không thể hủy đơn. Trạng thái đơn hoặc tồn kho có thể đã thay đổi. Vui lòng tải lại đơn hàng."
      : "Chưa thể hủy đơn hàng. Vui lòng thử lại.";
    // Đồng bộ lại nếu admin vừa xác nhận hoặc hủy đơn ở phiên khác.
    if (code === 409) await refresh();
  } finally {
    isCancelling.value = false;
  }
}

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

      <section v-if="canCancel || cancelSuccess || cancelError || order.status === 'cancelled'" class="rounded-xl bg-white p-6 shadow">
        <p v-if="cancelSuccess" role="status" class="text-green-700">{{ cancelSuccess }}</p>
        <p v-if="cancelError" role="alert" class="mb-3 text-red-700">{{ cancelError }}</p>
        <template v-if="canCancel">
          <p class="mb-3 text-sm text-slate-600">Bạn có thể hủy đơn khi đơn hàng còn chờ xác nhận.</p>
          <button type="button" :disabled="isCancelling"
            class="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
            @click="cancelOrder">
            {{ isCancelling ? "Đang hủy..." : "Hủy đơn hàng" }}
          </button>
        </template>
        <p v-else-if="order.status === 'cancelled'" class="text-slate-600">Đơn hàng đã được hủy.</p>
      </section>
    </div>
  </main>
</template>
