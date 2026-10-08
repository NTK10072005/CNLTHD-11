<script setup lang="ts">
import type { Product, ProductFormData } from '~/types/product'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const id = computed(() => String(route.params.id))
const isCreate = computed(() => id.value === 'create')
const submitting = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

const { data: product, status, error, refresh } = await useFetch<Product>(
  () => `/api/products/${id.value}`,
  { immediate: !isCreate.value },
)

useHead(() => ({ title: `${isCreate.value ? 'Thêm' : 'Chỉnh sửa'} sản phẩm | Shop điện tử 11` }))

async function save(data: ProductFormData) {
  saveError.value = ''
  saveSuccess.value = ''
  submitting.value = true
  try {
    if (isCreate.value) {
      const result = await $fetch<Product | { message: string }>('/api/products', {
        method: 'POST', body: data,
      })
      if (!('id' in result)) throw new Error('API thêm sản phẩm chưa trả về sản phẩm đã tạo.')
      await navigateTo(`/admin/products/${result.id}`)
      return
    }

    const result = await $fetch<Product | { message: string }>(`/api/products/${id.value}`, {
      method: 'PUT', body: data,
    })
    if (!('id' in result)) throw new Error('API cập nhật sản phẩm chưa trả về sản phẩm đã lưu.')
    await refresh()
    saveSuccess.value = 'Đã lưu thay đổi sản phẩm.'
  } catch (cause) {
    saveError.value = cause instanceof Error ? cause.message : 'Không thể lưu sản phẩm.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <NuxtLink to="/admin/products" class="text-sm font-semibold text-teal-700 hover:underline">← Danh sách sản phẩm</NuxtLink>
    <h1 class="my-6 text-3xl font-bold text-slate-900">{{ isCreate ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm' }}</h1>

    <p v-if="saveError" role="alert" class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{{ saveError }}</p>
    <p v-if="saveSuccess" role="status" class="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{{ saveSuccess }}</p>

    <div v-if="!isCreate && status === 'pending'" class="rounded-xl bg-white p-8 text-center">Đang tải sản phẩm...</div>
    <div v-else-if="!isCreate && error" role="alert" class="rounded-xl bg-red-50 p-8 text-center text-red-700">
      Không tìm thấy hoặc không thể tải sản phẩm này.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Thử lại</button>
    </div>
    <AdminProductForm
      v-else
      :key="isCreate ? 'create' : `${id}-${product?.id}`"
      :mode="isCreate ? 'create' : 'edit'"
      :product="isCreate ? null : product"
      :submitting="submitting"
      @submit="save"
      @cancel="navigateTo('/admin/products')"
    />
  </section>
</template>
