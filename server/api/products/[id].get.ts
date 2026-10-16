// server/api/products/[id].get.ts
import { mockProducts } from '~~/server/data/products'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product ID', message: 'Mã sản phẩm không hợp lệ.' })
  }
  const product = mockProducts.find((p) => p.id === Number(id))

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Product not found',
      message: `Không tìm thấy sản phẩm có mã #${id}`,
    })
  }

  return product
})
