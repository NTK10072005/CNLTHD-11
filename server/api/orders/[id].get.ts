import { mockOrders } from "../../data/orders";
import { requireUser } from "../../utils/auth";

export default defineEventHandler((event) => {
  const user = requireUser(event);
  const id = Number(getRouterParam(event, "id"));

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order ID không hợp lệ",
    });
  }

  const order = mockOrders.find((order) => order.id === id);

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: "Không tìm thấy đơn hàng",
    });
  }

  if (user.role !== "admin" && order.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: "Bạn không có quyền xem đơn hàng này." });
  }

  return order;
});
