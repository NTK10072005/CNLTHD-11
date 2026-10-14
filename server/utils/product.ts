import { createError } from "h3";
import { PRODUCT_CATEGORIES, type ProductCategory, type ProductFormData } from "../../shared/types/product";

export function parseProductForm(body: unknown): ProductFormData {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product data" });
  }
  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const image = typeof input.image === "string" ? input.image.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (!name || !image || !description) {
    throw createError({ statusCode: 400, statusMessage: "Missing product information", message: "Vui lòng nhập đầy đủ thông tin sản phẩm." });
  }
  if (!(PRODUCT_CATEGORIES as readonly unknown[]).includes(input.category)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product category" });
  }
  if (typeof input.price !== "number" || !Number.isSafeInteger(input.price) || input.price <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product price", message: "Giá phải là số nguyên VND lớn hơn 0." });
  }
  if (typeof input.stock !== "number" || !Number.isSafeInteger(input.stock) || input.stock < 0) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product stock", message: "Tồn kho phải là số nguyên không âm." });
  }
  if (!input.specs || typeof input.specs !== "object" || Array.isArray(input.specs) ||
      Object.values(input.specs).some((value) => typeof value !== "string")) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product specifications" });
  }
  return { name, image, description, category: input.category as ProductCategory,
    price: input.price, stock: input.stock, specs: { ...input.specs } as Record<string, string> };
}
