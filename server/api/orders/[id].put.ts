import { mockOrders } from "../../data/orders";
import { requireAdmin } from "../../utils/auth";
import { mockProducts } from "../../data/products";
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
    // Kiểm tra toàn bộ trước khi ghi, không hủy thành công khi hoàn kho bị thiếu/sai.
    const restoredQuantities = new Map<number, number>();
    for (const item of order.items) {
      const productId = Number(item.id);
      restoredQuantities.set(productId, (restoredQuantities.get(productId) ?? 0) + item.quantity);
    }
    const restorations = Array.from(restoredQuantities, ([productId, quantity]) => {
      const product = mockProducts.find((p) => p.id === productId);
      if (!product || !Number.isSafeInteger(quantity) || quantity <= 0 ||
          !Number.isSafeInteger(product.stock) || product.stock < 0 ||
          !Number.isSafeInteger(product.stock + quantity)) {
        throw createError({
          statusCode: 409,
          statusMessage: "Cannot restore product stock",
          message: "Không thể hoàn kho. Vui lòng kiểm tra sản phẩm và tồn kho trước khi hủy đơn.",
        });
      }
      return { product, quantity };
    });

    // Không await giữa hoàn kho và đổi trạng thái: mỗi đơn chỉ được hoàn kho một lần.
    for (const { product, quantity } of restorations) {
      product.stock += quantity;
      product.inStock = product.stock > 0;
    }
  }

  order.status = newStatus;

  return {
    message: "Cập nhật trạng thái đơn hàng thành công",
    order,
  };
});
