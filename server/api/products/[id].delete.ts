import { mockProducts } from "../../data/products";

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Mã sản phẩm không hợp lệ",
    });
  }

  const index = mockProducts.findIndex((product) => product.id === id);

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: "Không tìm thấy sản phẩm",
    });
  }

  // Xóa sản phẩm khỏi danh sách mock
  mockProducts.splice(index, 1);

  return {
    message: "Xóa sản phẩm thành công",
  };
});
