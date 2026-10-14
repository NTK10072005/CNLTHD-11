export const PRODUCT_CATEGORIES = ["phone", "laptop", "audio", "accessory"] as const;
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

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

// ID do server cấp; inStock luôn được tính từ stock.
export type ProductFormData = Omit<Product, "id" | "inStock">;
