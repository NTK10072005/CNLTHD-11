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
const errors = reactive({
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

function validateForm() {
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  const name = form.name.trim()
  const username = form.username.trim()
  const email = form.email.trim()
  const phone = form.phone.trim()
  const address = form.address.trim()

  if (!name) errors.name = 'Vui lòng nhập họ và tên.'
  else if (name.length < 2 || name.length > 60 || !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name)) {
    errors.name = 'Họ tên cần 2-60 ký tự, chỉ gồm chữ và dấu cách.'
  }

  if (!username) errors.username = 'Vui lòng nhập tên đăng nhập.'
  else if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
    errors.username = 'Tên đăng nhập gồm 3-20 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.'
  }

  if (!email) errors.email = 'Vui lòng nhập email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = 'Email không đúng định dạng.'
  }

  if (!phone) errors.phone = 'Vui lòng nhập số điện thoại.'
  else if (!/^0[0-9]{9}$/.test(phone)) {
    errors.phone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.'
  }

  if (!address) errors.address = 'Vui lòng nhập địa chỉ.'
  else if (address.length > 200) errors.address = 'Địa chỉ không được vượt quá 200 ký tự.'

  if (!form.password) errors.password = 'Vui lòng nhập mật khẩu.'
  else if (form.password.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự.'

  if (!form.confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'

  return !Object.values(errors).some(Boolean)
}

function clearFieldError(field: keyof typeof errors) {
  errors[field] = ''
}

async function submitRegistration() {
  errorMessage.value = ''

  if (!validateForm()) return

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

      <form novalidate @submit.prevent="submitRegistration">
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
              maxlength="60"
              :aria-invalid="Boolean(errors.name)"
              @input="clearFieldError('name')"
              required
            />
            <p v-if="errors.name" class="m-0 text-xs text-rose-600" role="alert">{{ errors.name }}</p>
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
              maxlength="20"
              :aria-invalid="Boolean(errors.username)"
              @input="clearFieldError('username')"
              required
            />
            <p v-if="errors.username" class="m-0 text-xs text-rose-600" role="alert">{{ errors.username }}</p>
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
              :aria-invalid="Boolean(errors.email)"
              @input="clearFieldError('email')"
              required
            />
            <p v-if="errors.email" class="m-0 text-xs text-rose-600" role="alert">{{ errors.email }}</p>
          </div>

          <div class="grid min-w-0 content-start gap-[7px]">
            <label class="text-[13px] font-bold text-[#213946]" for="phone">Số điện thoại</label>
            <input
              class="min-h-[46px] w-full rounded-lg border border-[#cedde1] bg-[#fbfdfd] px-3 font-sans text-sm text-[#142d3a] placeholder:text-[#91a1a8] focus:border-[#0caaa8] focus:outline-none focus:ring-[3px] focus:ring-[#0caaa81f]"
              id="phone"
              v-model="form.phone"
              name="phone"
              type="text"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="Nhập số điện thoại"
              minlength="10"
              maxlength="10"
              :aria-invalid="Boolean(errors.phone)"
              @input="clearFieldError('phone')"
              required
            />
            <p v-if="errors.phone" class="m-0 text-xs text-rose-600" role="alert">{{ errors.phone }}</p>
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
              maxlength="200"
              :aria-invalid="Boolean(errors.address)"
              @input="clearFieldError('address')"
              required
            />
            <p v-if="errors.address" class="m-0 text-xs text-rose-600" role="alert">{{ errors.address }}</p>
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
                :aria-invalid="Boolean(errors.password)"
                @input="clearFieldError('password')"
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
            <p v-if="errors.password" class="m-0 text-xs text-rose-600" role="alert">{{ errors.password }}</p>
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
                :aria-invalid="Boolean(errors.confirmPassword)"
                @input="clearFieldError('confirmPassword')"
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
            <p v-if="errors.confirmPassword" class="m-0 text-xs text-rose-600" role="alert">{{ errors.confirmPassword }}</p>
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

