import { mockProducts } from "../../data/products";
import type { ProductFormData } from "~~/app/types/product";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<ProductFormData>(event);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Mã sản phẩm không hợp lệ",
    });
  }

  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Không tìm thấy sản phẩm",
    });
  }

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
      statusMessage: "Giá sản phẩm không hợp lệ",
    });
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Số lượng tồn kho không hợp lệ",
    });
  }

  if (
    !body.specs ||
    typeof body.specs !== "object" ||
    Array.isArray(body.specs) ||
    Object.values(body.specs).some((value) => typeof value !== "string")
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thông số kỹ thuật không hợp lệ",
    });
  }

  // Cập nhật thông tin sản phẩm
  Object.assign(product, {
    name,
    category: body.category,
    price,
    stock,
    inStock: stock > 0,
    image,
    description,
    specs: { ...body.specs },
  });

  return {
    message: "Cập nhật sản phẩm thành công",
    product,
  };
});
