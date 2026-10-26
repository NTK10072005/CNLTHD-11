import { mockOrders } from "../../../data/orders";
import { requireUser } from "../../../utils/auth";
import { restoreOrderStock } from "../../../utils/order";

export default defineEventHandler((event) => {
  const user = requireUser(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Mã đơn hàng không hợp lệ" });
  }
  const order = mockOrders.find((item) => item.id === id);
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Không tìm thấy đơn hàng" });
  }
  if (order.userId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden",
      message: "Bạn không có quyền hủy đơn hàng này." });
  }
  if (order.status !== "pending") {
    throw createError({ statusCode: 409, statusMessage: "Order cannot be cancelled",
      message: "Chỉ có thể tự hủy đơn hàng đang chờ xác nhận. Vui lòng liên hệ cửa hàng nếu cần hỗ trợ." });
  }
  // Không await giữa kiểm tra trạng thái, hoàn kho và hủy: không hoàn kho lặp.
  restoreOrderStock(order);
  order.status = "cancelled";
  return { message: "Đã hủy đơn hàng thành công.", order };
});
