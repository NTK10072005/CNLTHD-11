import { mockOrders } from "../../data/orders";

export default defineEventHandler((event) => {
  const query = getQuery(event);

  const userId = Number(query.userId);

  if (!userId) {
    return mockOrders;
  }

  return mockOrders.filter((order) => order.userId === userId);
});
