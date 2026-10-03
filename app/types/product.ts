// app/types/product.ts
export interface Product {
    id: number;
    name: string;
    category: 'phone' | 'laptop' | 'audio' | 'accessory';
    price: number;
    inStock: boolean;
    image: string;
    description: string;
    specs: Record<string, string>;
}
