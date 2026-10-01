<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const { login } = useAuth()

useHead({ title: 'Đăng nhập | Shop điện tử 11' })

async function submitLogin() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const user = await login(username.value.trim(), password.value)
    await navigateTo(user.role === 'admin' ? '/admin' : '/')
  } catch {
    errorMessage.value = 'Tên đăng nhập hoặc mật khẩu chưa chính xác.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="grid min-h-[68vh] place-items-center bg-[#f1f6f7] bg-[radial-gradient(ellipse_at_50%_100%,#d8f1f3_0,transparent_55%)] px-4 py-8">
    <section class="w-full max-w-[440px] rounded-xl border border-[#dce8eb] bg-white p-[clamp(28px,6vw,48px)] shadow-[0_22px_60px_#0b29321a]" aria-labelledby="login-title">
      <NuxtLink class="mb-10 grid h-[54px] w-[88px] place-items-center" to="/" aria-label="Shop điện tử 11, về trang chủ">
        <img class="max-h-full max-w-full object-contain" src="/icon/logo-11.png" alt="Shop điện tử 11" />
      </NuxtLink>

      <p class="mb-2.5 text-[11px] font-extrabold tracking-[0.12em] text-[#078c91]">SHOP ĐIỆN TỬ 11</p>
      <h1 id="login-title" class="m-0 text-[clamp(26px,5vw,32px)] leading-[1.2] text-[#102b3a]">Chào mừng trở lại</h1>
      <p class="mb-7 mt-3 text-sm leading-[1.6] text-[#657782]">Đăng nhập để tiếp tục mua sắm và theo dõi đơn hàng.</p>

      <form class="grid gap-[10px]" @submit.prevent="submitLogin">
        <label class="text-[13px] font-bold text-[#213946]" for="username">Tên đăng nhập</label>
        <input
          class="h-12 w-full rounded-lg border border-[#cedde1] bg-[#fbfdfd] px-[14px] font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] focus:border-[#0caaa8] focus:outline-none focus:ring-[3px] focus:ring-[#0caaa81f]"
          id="username"
          v-model="username"
          name="username"
          type="text"
          autocomplete="username"
          placeholder="Nhập tên đăng nhập"
          required
        />

        <div class="mt-2 flex items-center justify-between">
          <label class="text-[13px] font-bold text-[#213946]" for="password">Mật khẩu</label>
        </div>
        <div class="flex h-12 w-full items-center rounded-lg border border-[#cedde1] bg-[#fbfdfd] focus-within:border-[#0caaa8] focus-within:ring-[3px] focus-within:ring-[#0caaa81f]">
          <input
            class="h-full min-w-0 flex-1 bg-transparent px-[14px] font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] outline-none"
            id="password"
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Nhập mật khẩu"
            required
          />
          <button
            class="grid size-11 flex-none place-items-center border-0 bg-transparent text-[#607781]"
            type="button"
            :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" class="w-5 fill-none stroke-current [stroke-width:1.7] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else class="w-5 fill-none stroke-current [stroke-width:1.7] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7" />
              <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.1 3.8M6.2 6.3C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" />
            </svg>
          </button>
        </div>

        <p v-if="errorMessage" class="my-0.5 text-[13px] text-[#bd3434]" role="alert">{{ errorMessage }}</p>

        <button class="mt-2.5 min-h-12 rounded-lg border-0 bg-[#0caaa8] font-sans font-extrabold text-white transition-[background,transform] hover:-translate-y-px hover:bg-[#078c91] disabled:cursor-wait disabled:opacity-70" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="mt-6 text-center text-[13px] text-[#657782]">
        Chưa có tài khoản?
        <NuxtLink class="ml-1 font-bold text-[#078c91] hover:underline" to="/register">Tạo tài khoản</NuxtLink>
      </p>
    </section>
  </main>
</template>
