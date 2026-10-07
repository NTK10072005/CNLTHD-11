import { mockOrders, getNextOrderId } from "../../data/orders";
import { mockProducts } from "../../data/products";

interface CreateOrderBody {
  userId: number;

  items: {
    id: number | string;
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];

  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    note?: string;
  };
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateOrderBody>(event);

  if (!body.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thiếu thông tin người dùng",
    });
  }

  if (!body.items || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Giỏ hàng đang trống",
    });
  }

  if (
    !body.shippingInfo?.name ||
    !body.shippingInfo?.phone ||
    !body.shippingInfo?.address
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thông tin nhận hàng chưa đầy đủ",
    });
  }

  // Kiểm tra tồn kho trước khi tạo đơn
  for (const item of body.items) {
    const product = mockProducts.find((p) => p.id === Number(item.id));
    if (product) {
      if (product.stock < item.quantity) {
        throw createError({
          statusCode: 400,
          statusMessage: `Sản phẩm "${product.name}" không đủ số lượng tồn kho (chỉ còn ${product.stock})`,
        });
      }
    }
  }

  const total = body.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const newOrder = {
    id: getNextOrderId(),

    userId: body.userId,

    items: body.items,

    shippingInfo: {
      name: body.shippingInfo.name,
      phone: body.shippingInfo.phone,
      address: body.shippingInfo.address,
      note: body.shippingInfo.note ?? "",
    },

    paymentMethod: "COD" as const,

    total,

    status: "pending" as const,

    createdAt: new Date().toISOString(),
  };

  // Trừ số lượng tồn kho thực tế trong mockProducts
  for (const item of body.items) {
    const product = mockProducts.find((p) => p.id === Number(item.id));
    if (product) {
      product.stock -= item.quantity;
      if (product.stock <= 0) {
        product.stock = 0;
        product.inStock = false;
      }
    }
  }

  mockOrders.push(newOrder);

  return {
    message: "Đặt hàng thành công",
    order: newOrder,
  };
});
