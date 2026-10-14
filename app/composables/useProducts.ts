import type { Product } from "~~/shared/types/product";

export const PRODUCT_LIST_KEY = "catalog-products";

export function useProducts() {
  // Cùng key và options để các trang chia sẻ dữ liệu sản phẩm/payload SSR.
  return useFetch<Product[]>("/api/products", {
    key: PRODUCT_LIST_KEY,
    default: () => [],
  });
}
