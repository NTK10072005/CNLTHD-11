import { mockUsers } from '../../data/users'
import { requireAdmin, toPublicUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  requireAdmin(event)
  return mockUsers.map(toPublicUser)
})
