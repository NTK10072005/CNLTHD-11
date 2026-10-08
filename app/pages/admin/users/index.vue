<script setup lang="ts">
type PublicUser = {
  id: number
  username: string
  email: string
  name: string
  phone?: string
  address?: string
  role: 'user' | 'admin'
}

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Khách hàng | Shop điện tử 11' })

const search = ref('')
const { data: users, status, error, refresh } = await useFetch<PublicUser[]>('/api/users', {
  key: 'admin-users-list', default: () => [],
})

const customers = computed(() => users.value.filter((user) => user.role === 'user'))
const filteredCustomers = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('vi-VN')
  return customers.value.filter((user) => !query || [user.name, user.username, user.email, user.phone ?? '']
    .some((value) => value.toLocaleLowerCase('vi-VN').includes(query)))
})
</script>

<template>
  <section>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Khách hàng</h1>
      <p class="mt-2 text-sm text-slate-500">Danh sách tài khoản khách hàng của cửa hàng.</p>
    </div>

    <div class="rounded-xl bg-white shadow">
      <div class="border-b border-slate-200 p-5">
        <label class="block max-w-lg text-sm font-medium text-slate-700">
          Tìm khách hàng
          <input v-model="search" type="search" placeholder="Tên, tài khoản, email hoặc số điện thoại" class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-teal-500">
        </label>
      </div>

      <p v-if="status === 'pending'" role="status" class="p-8 text-center text-slate-600">Đang tải khách hàng...</p>
      <div v-else-if="error" role="alert" class="p-8 text-center text-red-700">
        Không thể tải khách hàng.
        <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Thử lại</button>
      </div>
      <template v-else>
        <p class="border-b border-slate-100 px-5 py-3 text-sm text-slate-500">Hiển thị {{ filteredCustomers.length }} / {{ customers.length }} khách hàng</p>
        <p v-if="filteredCustomers.length === 0" class="p-8 text-center text-sm text-slate-500">Không có khách hàng phù hợp.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[650px] text-left text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" class="px-5 py-3">Khách hàng</th>
                <th scope="col" class="px-5 py-3">Tên đăng nhập</th>
                <th scope="col" class="px-5 py-3">Email</th>
                <th scope="col" class="px-5 py-3">Số điện thoại</th>
                <th scope="col" class="px-5 py-3">Địa chỉ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="user in filteredCustomers" :key="user.id" class="hover:bg-slate-50">
                <td class="px-5 py-4 font-semibold text-slate-900">{{ user.name }}</td>
                <td class="px-5 py-4 text-slate-700">{{ user.username }}</td>
                <td class="px-5 py-4 text-slate-700">{{ user.email }}</td>
                <td class="px-5 py-4 text-slate-700">{{ user.phone || 'Chưa cập nhật' }}</td>
                <td class="px-5 py-4 text-slate-700">{{ user.address || 'Chưa cập nhật' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </section>
</template>
