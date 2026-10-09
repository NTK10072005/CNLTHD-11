import { mockProducts } from "../../data/products";
import type { ProductFormData } from "~~/app/types/product";

export default defineEventHandler(async (event) => {
  const body = await readBody<ProductFormData>(event);

  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "Dữ liệu sản phẩm không hợp lệ",
    });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";

  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  const image = typeof body.image === "string" ? body.image.trim() : "";

  const price = Number(body.price);
  const stock = Number(body.stock);

  const categories = ["phone", "laptop", "audio", "accessory"];

  if (!name || !description || !image) {
    throw createError({
      statusCode: 400,
      statusMessage: "Vui lòng nhập đầy đủ thông tin sản phẩm",
    });
  }

  if (!categories.includes(body.category)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Danh mục sản phẩm không hợp lệ",
    });
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Giá sản phẩm phải lớn hơn 0",
    });
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Số lượng tồn kho không hợp lệ",
    });
  }

  const specs = body.specs;

  if (
    !specs ||
    typeof specs !== "object" ||
    Array.isArray(specs) ||
    Object.values(specs).some((value) => typeof value !== "string")
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thông số kỹ thuật không hợp lệ",
    });
  }

  const newId = Math.max(0, ...mockProducts.map((p) => p.id)) + 1;

  const newProduct = {
    id: newId,
    name,
    category: body.category,
    price,
    stock,
    inStock: stock > 0,
    image,
    description,
    specs: { ...specs },
  };

  mockProducts.push(newProduct);

  setResponseStatus(event, 201);

  return {
    message: "Thêm sản phẩm thành công",
    product: newProduct,
  };
});
