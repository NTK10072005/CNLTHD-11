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

  if (username.length < 3 || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Username cần ít nhất 3 ký tự và mật khẩu cần ít nhất 8 ký tự.' })
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
