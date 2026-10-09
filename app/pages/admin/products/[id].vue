<script setup lang="ts">
import type { Product, ProductFormData } from "~/types/product";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

useHead({
  title: "Chỉnh sửa sản phẩm | Shop điện tử 11",
});

const route = useRoute();
const id = computed(() => String(route.params.id));

const submitting = ref(false);
const saveError = ref("");
const saveSuccess = ref("");

const {
  data: product,
  status,
  error,
  refresh,
} = await useFetch<Product>(() => `/api/products/${id.value}`);

async function save(data: ProductFormData) {
  if (submitting.value) return;

  saveError.value = "";
  saveSuccess.value = "";
  submitting.value = true;

  try {
    await $fetch(`/api/products/${id.value}`, {
      method: "PUT",
      body: data,
    });

    await refresh();
    await refreshNuxtData("admin-products-list");

    saveSuccess.value = "Đã lưu thay đổi sản phẩm.";
  } catch (cause: any) {
    saveError.value =
      cause?.data?.statusMessage ||
      cause?.data?.message ||
      cause?.message ||
      "Không thể cập nhật sản phẩm.";
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  navigateTo("/admin/products");
}
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <NuxtLink
      to="/admin/products"
      class="text-sm font-semibold text-teal-700 hover:underline"
    >
      ← Danh sách sản phẩm
    </NuxtLink>

    <h1 class="my-6 text-3xl font-bold text-slate-900">Chỉnh sửa sản phẩm</h1>

    <p
      v-if="saveError"
      role="alert"
      class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"
    >
      {{ saveError }}
    </p>

    <p
      v-if="saveSuccess"
      role="status"
      class="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700"
    >
      {{ saveSuccess }}
    </p>

    <div
      v-if="status === 'pending'"
      class="rounded-xl bg-white p-8 text-center"
    >
      Đang tải sản phẩm...
    </div>

    <div
      v-else-if="error || !product"
      role="alert"
      class="rounded-xl bg-red-50 p-8 text-center text-red-700"
    >
      Không tìm thấy hoặc không thể tải sản phẩm này.

      <button
        type="button"
        class="ml-2 font-semibold underline"
        @click="refresh()"
      >
        Thử lại
      </button>
    </div>

    <AdminProductForm
      v-else
      :key="product.id"
      mode="edit"
      :product="product"
      :submitting="submitting"
      @submit="save"
      @cancel="handleCancel"
    />
  </section>
</template>
