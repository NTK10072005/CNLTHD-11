import { mockProducts } from "../../data/products";
import { mockOrders } from "../../data/orders";
import { requireAdmin } from "../../utils/auth";

export default defineEventHandler((event) => {
  requireAdmin(event);
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

  const hasActiveOrders = mockOrders.some((order) =>
    order.status !== "completed" && order.status !== "cancelled" &&
    order.items.some((item) => Number(item.id) === id),
  );

  if (hasActiveOrders) {
    throw createError({
      statusCode: 409,
      statusMessage: "Product has active orders",
      message: "Không thể xóa sản phẩm đang có đơn hàng chưa hoàn tất. Hãy hoàn tất hoặc hủy các đơn liên quan trước khi xóa.",
    });
  }

  // Kiểm tra và xóa đồng bộ để không xen kẽ với đặt hàng/hủy đơn trong mock server.
  mockProducts.splice(index, 1);

  return {
    message: "Xóa sản phẩm thành công",
  };
});
