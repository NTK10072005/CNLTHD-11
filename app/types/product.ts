export type ProductCategory = "phone" | "laptop" | "audio" | "accessory";

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  inStock: boolean;
  stock: number;
  image: string;
  description: string;
  specs: Record<string, string>;
}

/**
 * Dữ liệu dùng khi tạo hoặc chỉnh sửa sản phẩm.
 * Không có id vì id sẽ do mock API tạo.
 */
export interface ProductFormData {
  name: string;
  category: ProductCategory;
  price: number;
  inStock: boolean;
  stock: number;
  image: string;
  description: string;
  specs: Record<string, string>;
}
