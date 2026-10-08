import { mockUsers } from '../../data/users'

export default defineEventHandler(() => {
  return mockUsers.map(({ password: _password, ...user }) => user)
})
