import { mockOrders } from "../../data/orders";
import { requireAdmin } from "../../utils/auth";
import { restoreOrderStock } from "../../utils/order";
import type { OrderStatus } from "../../../shared/types/order";

interface UpdateOrderBody {
  status: OrderStatus;
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["completed"],
  completed: [],
  cancelled: [],
};

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Mã đơn hàng không hợp lệ",
    });
  }

  const order = mockOrders.find((item) => item.id === id);

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: "Không tìm thấy đơn hàng",
    });
  }

  const body = await readBody<UpdateOrderBody>(event);
  const newStatus = body?.status;

  if (!newStatus || !allowedTransitions[order.status].includes(newStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Không thể chuyển sang trạng thái này",
    });
  }

  // Khi hủy đơn, hoàn lại số lượng tồn kho.
  // API tạo đơn đã trừ tồn kho khi đặt hàng.
  if (newStatus === "cancelled") {
    restoreOrderStock(order);
  }

  order.status = newStatus;

  return {
    message: "Cập nhật trạng thái đơn hàng thành công",
    order,
  };
});
