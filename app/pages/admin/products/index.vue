<script setup lang="ts">
import type { Product, ProductCategory } from '~/types/product'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useHead({ title: 'Quản lý sản phẩm | Shop điện tử 11' })

const { formatPrice } = useFormatPrice()
const searchQuery = ref('')
const selectedCategory = ref<ProductCategory | 'all'>('all')
const actionError = ref('')
const deletingId = ref<number | null>(null)

const { data: products, status, error, refresh } = await useFetch<Product[]>('/api/products', {
  key: 'admin-products-list',
  default: () => [],
})

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả danh mục' },
  { value: 'phone', label: 'Điện thoại' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'audio', label: 'Âm thanh' },
  { value: 'accessory', label: 'Phụ kiện' },
]

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('vi-VN')
  return products.value.filter((product) => {
    const matchesCategory = selectedCategory.value === 'all' || product.category === selectedCategory.value
    const matchesSearch = !query || product.name.toLocaleLowerCase('vi-VN').includes(query) || String(product.id).includes(query)
    return matchesCategory && matchesSearch
  })
})

function categoryLabel(category: ProductCategory) {
  return categories.find((item) => item.value === category)?.label ?? category
}

async function deleteProduct(product: Product) {
  if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return

  actionError.value = ''
  deletingId.value = product.id

  try {
    await $fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    await refresh()

    if (error.value) {
      throw new Error('Không thể kiểm tra danh sách sản phẩm sau khi xóa.')
    }
    if (products.value.some((item) => item.id === product.id)) {
      throw new Error('API xóa chưa cập nhật dữ liệu. Sản phẩm vẫn còn trong danh sách.')
    }
  } catch (cause) {
    actionError.value = cause instanceof Error ? cause.message : 'Không thể xóa sản phẩm. Vui lòng thử lại.'
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <section>
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Quản lý sản phẩm</h1>
        <p class="mt-2 text-sm text-slate-500">Xem và cập nhật danh sách sản phẩm của cửa hàng.</p>
      </div>
      <NuxtLink
        to="/admin/products/create"
        class="inline-flex min-h-11 items-center rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
      >
        + Thêm sản phẩm
      </NuxtLink>
    </div>

    <div v-if="actionError" role="alert" class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {{ actionError }}
    </div>

    <div class="rounded-xl bg-white shadow">
      <div class="flex flex-wrap items-end gap-4 border-b border-slate-200 p-5">
        <label class="block min-w-56 flex-1 text-sm font-medium text-slate-700">
          Tìm theo tên hoặc mã sản phẩm
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Nhập tên hoặc mã sản phẩm"
            class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
          >
        </label>
        <label class="block min-w-48 text-sm font-medium text-slate-700">
          Danh mục
          <select
            v-model="selectedCategory"
            class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
          >
            <option v-for="category in categories" :key="category.value" :value="category.value">
              {{ category.label }}
            </option>
          </select>
        </label>
      </div>

      <div v-if="status === 'pending'" role="status" class="p-8 text-center text-sm text-slate-600">
        Đang tải danh sách sản phẩm...
      </div>
      <div v-else-if="error" role="alert" class="p-8 text-center">
        <p class="text-sm text-red-700">Không thể tải danh sách sản phẩm.</p>
        <button type="button" class="mt-3 text-sm font-semibold text-teal-700 hover:underline" @click="refresh()">
          Thử lại
        </button>
      </div>
      <div v-else>
        <p class="border-b border-slate-100 px-5 py-3 text-sm text-slate-500">
          Hiển thị {{ filteredProducts.length }} / {{ products.length }} sản phẩm
        </p>

        <div v-if="filteredProducts.length === 0" class="p-8 text-center text-sm text-slate-500">
          {{ products.length === 0 ? 'Chưa có sản phẩm nào.' : 'Không tìm thấy sản phẩm phù hợp.' }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" class="px-5 py-3 font-semibold">Sản phẩm</th>
                <th scope="col" class="px-5 py-3 font-semibold">Danh mục</th>
                <th scope="col" class="px-5 py-3 font-semibold">Giá</th>
                <th scope="col" class="px-5 py-3 font-semibold">Tồn kho</th>
                <th scope="col" class="px-5 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-slate-50">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <img :src="product.image" :alt="product.name" class="h-14 w-14 flex-none rounded-md border border-slate-200 object-contain">
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-900">{{ product.name }}</p>
                      <p class="mt-1 text-xs text-slate-500">Mã #{{ product.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-slate-700">{{ categoryLabel(product.category) }}</td>
                <td class="whitespace-nowrap px-5 py-4 font-medium text-slate-900">{{ formatPrice(product.price) }}</td>
                <td class="px-5 py-4">
                  <span :class="product.inStock && product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'" class="rounded-md px-2.5 py-1 text-xs font-semibold">
                    {{ product.inStock && product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-right">
                  <NuxtLink :to="`/admin/products/${product.id}`" class="font-semibold text-teal-700 hover:underline">Sửa</NuxtLink>
                  <button
                    type="button"
                    :disabled="deletingId !== null"
                    class="ml-4 font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    @click="deleteProduct(product)"
                  >
                    {{ deletingId === product.id ? 'Đang xóa...' : 'Xóa' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
