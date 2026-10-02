<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const { registerAccount } = useAuth()

useHead({ title: 'Đăng ký | Shop điện tử 11' })

async function submitRegistration() {
  errorMessage.value = ''

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  isSubmitting.value = true

  try {
    await registerAccount({
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      password: form.password,
    })
    await navigateTo('/')
  } catch {
    errorMessage.value = 'Không thể tạo tài khoản. Username hoặc email có thể đã được sử dụng.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="grid min-h-[68vh] place-items-center bg-[#f1f6f7] bg-[radial-gradient(ellipse_at_50%_100%,#d8f1f3_0,transparent_55%)] px-4 py-8">
    <section class="w-full max-w-[600px] rounded-xl border border-[#dce8eb] bg-white p-[clamp(26px,5vw,44px)] shadow-[0_22px_60px_#0b29321a]" aria-labelledby="register-title">
      <NuxtLink class="mb-10 grid h-[54px] w-[88px] place-items-center" to="/" aria-label="Shop điện tử 11, về trang chủ">
        <img class="max-h-full max-w-full object-contain" src="/icon/logo-11.png" alt="Shop điện tử 11" />
      </NuxtLink>

      <p class="mb-2.5 text-[11px] font-extrabold tracking-[0.12em] text-[#078c91]">SHOP ĐIỆN TỬ 11</p>
      <h1 id="register-title" class="m-0 text-[clamp(26px,5vw,32px)] leading-[1.2] text-[#102b3a]">Tạo tài khoản</h1>
      <p class="mb-6 mt-2.5 text-sm leading-[1.6] text-[#657782]">Đăng ký để mua sắm và theo dõi đơn hàng dễ dàng hơn.</p>

      <form @submit.prevent="submitRegistration">
        <div class="grid grid-cols-1 gap-4 min-[521px]:grid-cols-2">
          <div class="grid min-w-0 content-start gap-[7px]">
            <label class="text-[13px] font-bold text-[#213946]" for="name">Họ và tên</label>
            <input
              class="min-h-[46px] w-full rounded-lg border border-[#cedde1] bg-[#fbfdfd] px-3 font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] focus:border-[#0caaa8] focus:outline-none focus:ring-[3px] focus:ring-[#0caaa81f]"
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              autocomplete="name"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div class="grid min-w-0 content-start gap-[7px]">
            <label class="text-[13px] font-bold text-[#213946]" for="username">Tên đăng nhập</label>
            <input
              class="min-h-[46px] w-full rounded-lg border border-[#cedde1] bg-[#fbfdfd] px-3 font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] focus:border-[#0caaa8] focus:outline-none focus:ring-[3px] focus:ring-[#0caaa81f]"
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              autocomplete="username"
              placeholder="Tạo tên đăng nhập"
              minlength="3"
              required
            />
          </div>

          <div class="grid min-w-0 content-start gap-[7px]">
            <label class="text-[13px] font-bold text-[#213946]" for="email">Email</label>
            <input
              class="min-h-[46px] w-full rounded-lg border border-[#cedde1] bg-[#fbfdfd] px-3 font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] focus:border-[#0caaa8] focus:outline-none focus:ring-[3px] focus:ring-[#0caaa81f]"
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="ten@email.com"
              required
            />
          </div>

          <div class="grid min-w-0 content-start gap-[7px]">
            <label class="text-[13px] font-bold text-[#213946]" for="phone">Số điện thoại</label>
            <input
              class="min-h-[46px] w-full rounded-lg border border-[#cedde1] bg-[#fbfdfd] px-3 font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] focus:border-[#0caaa8] focus:outline-none focus:ring-[3px] focus:ring-[#0caaa81f]"
              id="phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              autocomplete="tel"
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div class="col-span-full grid min-w-0 content-start gap-[7px] min-[521px]:col-span-2">
            <label class="text-[13px] font-bold text-[#213946]" for="address">Địa chỉ</label>
            <textarea
              class="min-h-[72px] w-full resize-y rounded-lg border border-[#cedde1] bg-[#fbfdfd] px-3 pb-2 pt-[11px] font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] focus:border-[#0caaa8] focus:outline-none focus:ring-[3px] focus:ring-[#0caaa81f]"
              id="address"
              v-model="form.address"
              name="address"
              autocomplete="street-address"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              rows="2"
              required
            />
          </div>

          <div class="grid min-w-0 content-start gap-[7px]">
            <label class="text-[13px] font-bold text-[#213946]" for="password">Mật khẩu</label>
            <div class="flex min-h-[46px] w-full items-center rounded-lg border border-[#cedde1] bg-[#fbfdfd] focus-within:border-[#0caaa8] focus-within:ring-[3px] focus-within:ring-[#0caaa81f]">
              <input
                class="h-11 min-w-0 flex-1 bg-transparent px-3 font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] outline-none"
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Tối thiểu 8 ký tự"
                minlength="8"
                required
              />
              <button
                class="min-h-[42px] min-w-12 border-0 bg-transparent font-sans text-xs font-bold text-[#078c91]"
                type="button"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ẩn' : 'Hiện' }}
              </button>
            </div>
          </div>

          <div class="grid min-w-0 content-start gap-[7px]">
            <label class="text-[13px] font-bold text-[#213946]" for="confirm-password">Xác nhận mật khẩu</label>
            <div class="flex min-h-[46px] w-full items-center rounded-lg border border-[#cedde1] bg-[#fbfdfd] focus-within:border-[#0caaa8] focus-within:ring-[3px] focus-within:ring-[#0caaa81f]">
              <input
                class="h-11 min-w-0 flex-1 bg-transparent px-3 font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] outline-none"
                id="confirm-password"
                v-model="form.confirmPassword"
                name="confirm-password"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Nhập lại mật khẩu"
                minlength="8"
                required
              />
              <button
                class="min-h-[42px] min-w-12 border-0 bg-transparent font-sans text-xs font-bold text-[#078c91]"
                type="button"
                :aria-label="showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                :aria-pressed="showConfirmPassword"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? 'Ẩn' : 'Hiện' }}
              </button>
            </div>
          </div>
        </div>

        <p v-if="errorMessage" class="mb-0 mt-3.5 text-[13px] text-[#bd3434]" role="alert">{{ errorMessage }}</p>

        <button class="mt-[22px] min-h-12 w-full rounded-lg border-0 bg-[#0caaa8] font-sans font-extrabold text-white transition-[background,transform] hover:-translate-y-px hover:bg-[#078c91] disabled:cursor-wait disabled:opacity-70" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản' }}
        </button>
      </form>

      <p class="mt-[22px] text-center text-[13px] text-[#657782]">
        Đã có tài khoản?
        <NuxtLink class="ml-1 font-bold text-[#078c91] no-underline hover:underline" to="/login">Đăng nhập</NuxtLink>
      </p>
    </section>
  </main>
</template>

