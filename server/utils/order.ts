import { createError } from "h3";
import { mockProducts } from "../data/products";
import type { Order } from "../../shared/types/order";

// Kiểm tra toàn bộ trước khi ghi. Hàm đồng bộ để không hoàn kho một phần.
export function restoreOrderStock(order: Order) {
  const quantities = new Map<number, number>();
  for (const item of order.items) {
    const id = Number(item.id);
    quantities.set(id, (quantities.get(id) ?? 0) + item.quantity);
  }
  const restorations = Array.from(quantities, ([id, quantity]) => {
    const product = mockProducts.find((item) => item.id === id);
    if (!product || !Number.isSafeInteger(quantity) || quantity <= 0 ||
        !Number.isSafeInteger(product.stock) || product.stock < 0 ||
        !Number.isSafeInteger(product.stock + quantity)) {
      throw createError({ statusCode: 409, statusMessage: "Cannot restore product stock",
        message: "Không thể hoàn kho. Vui lòng kiểm tra sản phẩm và tồn kho trước khi hủy đơn." });
    }
    return { product, quantity };
  });
  for (const { product, quantity } of restorations) {
    product.stock += quantity;
    product.inStock = product.stock > 0;
  }
}
