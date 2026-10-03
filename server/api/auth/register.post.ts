import { mockUsers } from '../../data/users'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    username?: unknown
    email?: unknown
    name?: unknown
    phone?: unknown
    address?: unknown
    password?: unknown
  }>(event)

  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
  const address = typeof body?.address === 'string' ? body.address.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!username || !email || !name || !phone || !address || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng điền đầy đủ thông tin.' })
  }

  if (name.length < 2 || name.length > 60 || !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name)) {
    throw createError({ statusCode: 400, statusMessage: 'Họ tên cần 2-60 ký tự, chỉ gồm chữ và dấu cách.' })
  }

  if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
    throw createError({ statusCode: 400, statusMessage: 'Tên đăng nhập gồm 3-20 ký tự: chữ không dấu, số, dấu chấm hoặc gạch dưới.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email không đúng định dạng.' })
  }

  if (!/^0[0-9]{9}$/.test(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.' })
  }

  if (address.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Địa chỉ không được vượt quá 200 ký tự.' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Mật khẩu cần ít nhất 8 ký tự.' })
  }

  const alreadyRegistered = mockUsers.some(
    (candidate) => candidate.username.toLowerCase() === username.toLowerCase() || candidate.email.toLowerCase() === email,
  )

  if (alreadyRegistered) {
    throw createError({ statusCode: 409, statusMessage: 'Username hoặc email đã được sử dụng.' })
  }

  const newUser = {
    id: Math.max(0, ...mockUsers.map((candidate) => candidate.id)) + 1,
    username,
    email,
    password,
    name,
    phone,
    address,
    role: 'user' as const,
  }
  mockUsers.push(newUser)

  const { password: _password, ...user } = newUser
  return { user }
})
