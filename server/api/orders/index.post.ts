import { mockOrders, getNextOrderId } from "../../data/orders";
import { mockProducts, type Product } from "../../data/products";
import { requireUser } from "../../utils/auth";
import type { Order } from "../../../shared/types/order";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default defineEventHandler(async (event) => {
  const user = requireUser(event);
  // TypeScript không kiểm tra JSON lúc chạy: xác thực từng trường trước khi dùng.
  const body = await readBody<unknown>(event);

  if (!isRecord(body)) {
    throw createError({ statusCode: 400, statusMessage: "Dữ liệu đặt hàng không hợp lệ." });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Giỏ hàng đang trống",
    });
  }

  const shipping = body.shippingInfo;
  if (!isRecord(shipping) || typeof shipping.name !== "string" ||
    typeof shipping.phone !== "string" || typeof shipping.address !== "string" ||
    (shipping.note !== undefined && typeof shipping.note !== "string")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thông tin nhận hàng chưa đầy đủ",
    });
  }


  const name = shipping.name.trim();
  const address = shipping.address.trim();
  const note = typeof shipping.note === "string" ? shipping.note.trim() : "";
  if (name.length < 2 || name.length > 60 || !address || address.length > 200 || note.length > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: "Họ tên cần 2-60 ký tự, địa chỉ cần 1-200 ký tự, ghi chú tối đa 1000 ký tự.",
    });
  }

  const cleanPhone = shipping.phone.replace(/[\s.-]/g, "");
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Số điện thoại không hợp lệ (phải gồm 10 chữ số và bắt đầu bằng số 0)",
    });
  }

  // Gộp ID trùng trước khi kiểm tra tồn kho, kể cả ID dạng số/chuỗi.
  const quantities = new Map<number, number>();
  const expectedPrices = new Map<number, number>();
  for (const item of body.items) {
    if (!isRecord(item)) {
      throw createError({ statusCode: 400, statusMessage: "Dòng sản phẩm không hợp lệ." });
    }

    const id = typeof item.id === "number" ? item.id
      : typeof item.id === "string" && /^\d+$/.test(item.id.trim()) ? Number(item.id.trim()) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0 || typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Mã sản phẩm và số lượng phải là số nguyên dương hợp lệ.",
      });
    }

    // expectedPrice chỉ để so sánh giá khách vừa xác nhận, không dùng để tính tiền.
    if (item.expectedPrice !== undefined) {
      if (typeof item.expectedPrice !== "number" || !Number.isSafeInteger(item.expectedPrice) || item.expectedPrice <= 0) {
        throw createError({ statusCode: 400, statusMessage: "Invalid expected price" });
      }
      if (expectedPrices.has(id) && expectedPrices.get(id) !== item.expectedPrice) {
        throw createError({
          statusCode: 409, statusMessage: "Conflicting expected prices",
          message: "Giá trong giỏ hàng không nhất quán. Vui lòng kiểm tra lại."
        });
      }
      expectedPrices.set(id, item.expectedPrice);
    }

    const quantity = (quantities.get(id) ?? 0) + item.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw createError({ statusCode: 400, statusMessage: "Tổng số lượng sản phẩm không hợp lệ." });
    }
    quantities.set(id, quantity);
  }

  const items: Order["items"] = [];
  const reservations: { product: Product; quantity: number }[] = [];
  let total = 0;

  for (const [id, quantity] of quantities) {
    const product = mockProducts.find((item) => item.id === id);
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: `Không tìm thấy sản phẩm có mã #${id}.` });
    }
    if (!Number.isSafeInteger(product.price) || product.price <= 0 ||
      !Number.isSafeInteger(product.stock) || product.stock < 0) {
      throw createError({ statusCode: 500, statusMessage: "Dữ liệu giá hoặc tồn kho sản phẩm không hợp lệ." });
    }
    if (expectedPrices.has(id) && expectedPrices.get(id) !== product.price) {
      throw createError({
        statusCode: 409, statusMessage: "Product price changed",
        message: `Giá sản phẩm "${product.name}" vừa thay đổi. Vui lòng bấm đặt hàng lại để cập nhật giỏ và xác nhận tổng tiền mới.`
      });
    }
    if (!product.inStock || quantity > product.stock) {
      throw createError({
        statusCode: 409,
        statusMessage: `Sản phẩm "${product.name}" không đủ số lượng tồn kho (chỉ còn ${product.stock}).`,
      });
    }

    total += product.price * quantity;
    if (!Number.isSafeInteger(total)) {
      throw createError({ statusCode: 400, statusMessage: "Tổng giá trị đơn hàng vượt giới hạn cho phép." });
    }
    items.push({
      id: product.id, name: product.name, price: product.price,
      image: product.image, quantity
    });
    reservations.push({ product, quantity });
  }

  const newOrder: Order = {
    id: getNextOrderId(),

    userId: user.id,

    items,

    shippingInfo: {
      name,
      phone: cleanPhone,
      address,
      note,
    },

    paymentMethod: "COD" as const,

    total,

    status: "pending" as const,

    createdAt: new Date().toISOString(),
  };


  for (const { product, quantity } of reservations) {
    product.stock -= quantity;
    product.inStock = product.stock > 0;
  }

  mockOrders.push(newOrder);

  return {
    message: "Đặt hàng thành công",
    order: newOrder,
  };
});
