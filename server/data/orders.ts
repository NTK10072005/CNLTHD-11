import type { Order } from "~/types/order";
export let mockOrders: Order[] = [];

export function getNextOrderId() {
  if (mockOrders.length === 0) {
    return 1;
  }

  return Math.max(...mockOrders.map((order) => order.id)) + 1;
}
