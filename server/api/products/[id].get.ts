// server/api/products/[id].get.ts
import { mockProducts } from '~~/server/data/products'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const product = mockProducts.find((p) => p.id === Number(id))

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: `Không tìm thấy sản phẩm có mã #${id}`,
    })
  }

  return product
})
