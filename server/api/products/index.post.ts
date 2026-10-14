import { mockProducts, getNextProductId } from "../../data/products";
import { requireAdmin } from "../../utils/auth";
import { parseProductForm } from "../../utils/product";
import type { Product } from "../../../shared/types/product";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const data = parseProductForm(await readBody<unknown>(event));
  const newProduct: Product = {
    id: getNextProductId(),
    ...data,
    inStock: data.stock > 0,
  };
  mockProducts.push(newProduct);
  setResponseStatus(event, 201);
  return { message: "Thêm sản phẩm thành công", product: newProduct };
});
