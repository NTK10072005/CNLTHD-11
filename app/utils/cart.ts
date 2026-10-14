import type { CartItem } from "../../shared/types/cart";
import type { Product } from "../../shared/types/product";

export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  const ids = new Set<number>();
  let total = 0;
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const id = typeof item.id === "number" ? item.id
      : typeof item.id === "string" && /^\d+$/.test(item.id.trim()) ? Number(item.id.trim()) : NaN;
    if (!Number.isSafeInteger(id) || id <= 0 || ids.has(id) ||
        typeof item.name !== "string" || !item.name.trim() ||
        typeof item.image !== "string" || !item.image.trim() ||
        !Number.isSafeInteger(item.price) || item.price <= 0 ||
        !Number.isSafeInteger(item.quantity) || item.quantity <= 0 ||
        (item.stock !== undefined && (!Number.isSafeInteger(item.stock) || item.stock < 0)) ||
        !Number.isSafeInteger(total + item.price * item.quantity)) continue;
    result.push({ id, name: item.name.trim(), image: item.image.trim(),
      price: item.price, quantity: item.quantity,
      ...(item.stock !== undefined ? { stock: item.stock } : {}) });
    ids.add(id);
    total += item.price * item.quantity;
  }
  return result;
}

// Storage có thể bị chặn hoặc hết dung lượng; giỏ trong bộ nhớ vẫn hoạt động.
export function readStoredCart(storage: Pick<Storage, "getItem">): CartItem[] {
  try {
    const saved = storage.getItem("nuxt_cart");
    return saved ? normalizeCart(JSON.parse(saved)) : [];
  } catch {
    return [];
  }
}

export function writeStoredCart(storage: Pick<Storage, "setItem">, cart: CartItem[]): boolean {
  try {
    storage.setItem("nuxt_cart", JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

export function reconcileCart(cart: CartItem[], products: Product[]) {
  const catalog = new Map(products.map((product) => [product.id, product]));
  const items: CartItem[] = [];
  const changes: string[] = [];
  for (const item of cart) {
    const product = catalog.get(Number(item.id));
    if (!product) {
      changes.push(`Đã bỏ "${item.name}" vì sản phẩm không còn được bán.`);
      continue;
    }
    if (!product.inStock || product.stock <= 0) {
      changes.push(`Đã bỏ "${item.name}" vì sản phẩm đã hết hàng.`);
      continue;
    }
    const quantity = Math.min(item.quantity, product.stock);
    if (item.price !== product.price) {
      changes.push(`Giá "${product.name}" đổi từ ${item.price.toLocaleString("vi-VN")} ₫ sang ${product.price.toLocaleString("vi-VN")} ₫.`);
    }
    if (quantity !== item.quantity) {
      changes.push(`Số lượng "${product.name}" giảm từ ${item.quantity} xuống ${quantity} theo tồn kho hiện tại.`);
    }
    items.push({ id: product.id, name: product.name, image: product.image,
      price: product.price, stock: product.stock, quantity });
  }
  return { items, changes };
}
