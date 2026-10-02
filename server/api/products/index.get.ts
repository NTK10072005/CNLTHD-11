// server/api/products/index.get.ts
import { mockProducts } from '~~/server/data/products'

export default defineEventHandler(() => {
  return mockProducts
})
