import { mockUsers } from '../../data/users'
import { createServerSession, toPublicUser } from '../../utils/auth'
import { verifyPassword } from '../../utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown; password?: unknown }>(event)
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!username || !password || password.length > 256) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập tên đăng nhập và mật khẩu.' })
  }

  const matchedUser = mockUsers.find(
    (candidate) => candidate.username.toLowerCase() === username || candidate.email.toLowerCase() === username,
  )

  // Kiểm tra cả tài khoản không tồn tại để tránh bỏ qua chi phí hash.
  const validPassword = await verifyPassword(password, matchedUser?.passwordHash ?? mockUsers[0]!.passwordHash)
  if (!matchedUser || !validPassword) {
    throw createError({ statusCode: 401, statusMessage: 'Tên đăng nhập hoặc mật khẩu chưa chính xác.' })
  }

  createServerSession(event, matchedUser.id)
  return { user: toPublicUser(matchedUser) }
})
