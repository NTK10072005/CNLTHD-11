import { mockOrders } from "../../data/orders";

export default defineEventHandler((event) => {
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

  return order;
});
