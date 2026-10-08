<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/order'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Quản lý đơn hàng | Shop điện tử 11' })

const { formatPrice } = useFormatPrice()
const search = ref('')
const selectedStatus = ref<OrderStatus | 'all'>('all')
const { data: orders, status, error, refresh } = await useFetch<Order[]>('/api/orders', {
  key: 'admin-orders-list', default: () => [],
})

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}

const filteredOrders = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('vi-VN')
  return orders.value
    .filter((order) => selectedStatus.value === 'all' || order.status === selectedStatus.value)
    .filter((order) => !query || String(order.id).includes(query) || order.shippingInfo.name.toLocaleLowerCase('vi-VN').includes(query))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
</script>

<template>
  <section>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Quản lý đơn hàng</h1>
      <p class="mt-2 text-sm text-slate-500">Theo dõi các đơn hàng được tạo trong cửa hàng.</p>
    </div>

    <div class="rounded-xl bg-white shadow">
      <div class="flex flex-wrap gap-4 border-b border-slate-200 p-5">
        <label class="min-w-56 flex-1 text-sm font-medium text-slate-700">
          Tìm đơn hàng
          <input v-model="search" type="search" placeholder="Mã đơn hoặc tên người nhận" class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-teal-500">
        </label>
        <label class="min-w-44 text-sm font-medium text-slate-700">
          Trạng thái
          <select v-model="selectedStatus" class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-teal-500">
            <option value="all">Tất cả trạng thái</option>
            <option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option>
          </select>
        </label>
      </div>

      <p v-if="status === 'pending'" role="status" class="p-8 text-center text-slate-600">Đang tải đơn hàng...</p>
      <div v-else-if="error" role="alert" class="p-8 text-center text-red-700">
        Không thể tải đơn hàng.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Thử lại</button>
      </div>
      <template v-else>
        <p class="border-b border-slate-100 px-5 py-3 text-sm text-slate-500">Hiển thị {{ filteredOrders.length }} / {{ orders.length }} đơn hàng</p>
        <p v-if="filteredOrders.length === 0" class="p-8 text-center text-sm text-slate-500">Không có đơn hàng phù hợp.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[800px] text-left text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" class="px-5 py-3">Mã đơn</th>
                <th scope="col" class="px-5 py-3">Người nhận</th>
                <th scope="col" class="px-5 py-3">Ngày đặt</th>
                <th scope="col" class="px-5 py-3">Sản phẩm</th>
                <th scope="col" class="px-5 py-3">Tổng tiền</th>
                <th scope="col" class="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-slate-50">
                <td class="px-5 py-4 font-semibold text-teal-700">#{{ order.id }}</td>
                <td class="px-5 py-4">
                  <p class="font-semibold text-slate-900">{{ order.shippingInfo.name }}</p>
                  <p class="text-xs text-slate-500">{{ order.shippingInfo.phone }}</p>
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-slate-700">{{ formatDate(order.createdAt) }}</td>
                <td class="px-5 py-4 text-slate-700">{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}</td>
                <td class="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{{ formatPrice(order.total) }}</td>
                <td class="px-5 py-4"><span class="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{{ statusLabels[order.status] }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </section>
</template>
