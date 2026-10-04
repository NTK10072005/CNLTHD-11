<script setup lang="ts">
const { cart, totalPrice, clearCart } = useCart();
const { user } = useAuth();

definePageMeta({
  middleware: "auth",
});

useHead({
  title: "Thanh toán | Shop điện tử 11",
});

const form = reactive({
  name: user.value?.name ?? "",
  phone: user.value?.phone ?? "",
  address: user.value?.address ?? "",
  note: "",
});

const isSubmitting = ref(false);
const errorMessage = ref("");

async function placeOrder() {
  errorMessage.value = "";

  if (cart.value.length === 0) {
    errorMessage.value = "Giỏ hàng đang trống.";
    return;
  }

  if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
    errorMessage.value = "Vui lòng nhập đầy đủ thông tin nhận hàng.";
    return;
  }

  if (!user.value) {
    await navigateTo("/login");
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await $fetch<{
      order: {
        id: number;
      };
    }>("/api/orders", {
      method: "POST",

      body: {
        userId: user.value.id,

        items: cart.value,

        shippingInfo: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim(),
        },
      },
    });

    clearCart();

    await navigateTo(`/orders/${response.order.id}`);
  } catch (error) {
    console.error(error);

    errorMessage.value = "Không thể tạo đơn hàng. Vui lòng thử lại.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-10">
    <h1 class="mb-8 text-3xl font-bold text-slate-900">Thanh toán</h1>

    <div
      v-if="cart.length === 0"
      class="rounded-xl bg-white p-10 text-center shadow"
    >
      <p class="mb-4 text-slate-600">Giỏ hàng của bạn đang trống.</p>

      <NuxtLink to="/products" class="font-semibold text-teal-600">
        Tiếp tục mua sắm
      </NuxtLink>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-[1fr_380px]">
      <!-- Shipping -->
      <section class="rounded-xl bg-white p-6 shadow">
        <h2 class="mb-6 text-xl font-bold">Thông tin nhận hàng</h2>

        <form id="checkout-form" class="space-y-5" @submit.prevent="placeOrder">
          <div>
            <label for="name" class="mb-2 block text-sm font-semibold">
              Họ tên
            </label>

            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label for="phone" class="mb-2 block text-sm font-semibold">
              Số điện thoại
            </label>

            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              required
              class="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label for="address" class="mb-2 block text-sm font-semibold">
              Địa chỉ nhận hàng
            </label>

            <textarea
              id="address"
              v-model="form.address"
              required
              rows="3"
              class="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label for="note" class="mb-2 block text-sm font-semibold">
              Ghi chú
            </label>

            <textarea
              id="note"
              v-model="form.note"
              rows="3"
              class="w-full rounded-lg border p-3"
            />
          </div>

          <div class="rounded-lg border bg-slate-50 p-4">
            <p class="font-semibold">Phương thức thanh toán</p>

            <label class="mt-3 flex items-center gap-3">
              <input type="radio" checked disabled />

              <span> Thanh toán khi nhận hàng (COD) </span>
            </label>
          </div>

          <p v-if="errorMessage" class="text-sm text-red-600">
            {{ errorMessage }}
          </p>
        </form>
      </section>

      <!-- Summary -->
      <aside class="h-fit rounded-xl bg-white p-6 shadow">
        <h2 class="mb-5 text-xl font-bold">Đơn hàng</h2>

        <div class="space-y-4">
          <div
            v-for="item in cart"
            :key="item.id"
            class="flex gap-3 border-b pb-4"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="h-16 w-16 rounded-lg object-cover"
            />

            <div class="min-w-0 flex-1">
              <p class="font-medium">
                {{ item.name }}
              </p>

              <p class="text-sm text-slate-500">
                Số lượng: {{ item.quantity }}
              </p>

              <p class="text-sm font-semibold">
                {{ (item.price * item.quantity).toLocaleString("vi-VN") }}
                ₫
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-between text-lg font-bold">
          <span>Tổng cộng</span>

          <span> {{ totalPrice.toLocaleString("vi-VN") }} ₫ </span>
        </div>

        <button
          form="checkout-form"
          type="submit"
          :disabled="isSubmitting"
          class="mt-6 w-full rounded-lg bg-teal-600 px-4 py-3 font-bold text-white disabled:opacity-60"
        >
          {{ isSubmitting ? "Đang đặt hàng..." : "Đặt hàng COD" }}
        </button>
      </aside>
    </div>
  </main>
</template>
