export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}
