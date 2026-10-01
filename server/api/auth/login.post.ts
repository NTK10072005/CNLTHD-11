import { mockUsers } from '../../data/users'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown; password?: unknown }>(event)
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập tên đăng nhập và mật khẩu.' })
  }

  const matchedUser = mockUsers.find(
    (candidate) => candidate.username.toLowerCase() === username || candidate.email.toLowerCase() === username,
  )

  if (!matchedUser || matchedUser.password !== password) {
    throw createError({ statusCode: 401, statusMessage: 'Tên đăng nhập hoặc mật khẩu chưa chính xác.' })
  }

  const { password: _password, ...user } = matchedUser
  return { user }
})
