import { mockProducts } from "../../data/products";
import { requireAdmin } from "../../utils/auth";
import { parseProductForm } from "../../utils/product";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product ID" });
  }
  const product = mockProducts.find((item) => item.id === id);
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }
  const data = parseProductForm(await readBody<unknown>(event));
  Object.assign(product, data, { inStock: data.stock > 0 });
  return { message: "Cập nhật sản phẩm thành công", product };
});
