<script setup lang="ts">
import type { ProductFormData } from "~/types/product";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useHead({
  title: "Thêm sản phẩm | Shop điện tử 11",
});

const submitting = ref(false);
const errorMessage = ref("");

async function handleSubmit(data: ProductFormData) {
  if (submitting.value) return;

  submitting.value = true;
  errorMessage.value = "";

  try {
    await $fetch("/api/products", {
      method: "POST",
      body: data,
    });

    await refreshNuxtData("admin-products-list");
    await navigateTo("/admin/products");
  } catch (error: any) {
    errorMessage.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      "Không thể thêm sản phẩm. Vui lòng thử lại.";
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  navigateTo("/admin/products");
}
</script>

<template>
  <section>
    <div class="mb-6">
      <NuxtLink
        to="/admin/products"
        class="text-sm font-semibold text-teal-700 hover:underline"
      >
        ← Quay lại danh sách sản phẩm
      </NuxtLink>

      <h1 class="mt-4 text-3xl font-bold text-slate-900">Thêm sản phẩm mới</h1>

      <p class="mt-2 text-sm text-slate-500">
        Nhập thông tin để thêm sản phẩm vào cửa hàng.
      </p>
    </div>

    <div
      v-if="errorMessage"
      role="alert"
      class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ errorMessage }}
    </div>

    <AdminProductForm
      mode="create"
      :submitting="submitting"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </section>
</template>
