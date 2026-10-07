import type { CartItem } from "~/composables/useCart";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "completed"
  | "cancelled";

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export interface OrderItem extends CartItem {}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];

  shippingInfo: ShippingInfo;

  paymentMethod: "COD";

  total: number;
  status: OrderStatus;

  createdAt: string;
}
