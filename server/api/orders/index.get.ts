import { mockOrders } from "../../data/orders";
import { requireUser } from "../../utils/auth";

export default defineEventHandler((event) => {
  const user = requireUser(event);
  // Khách hàng luôn chỉ thấy đơn của mình, bất kể query userId.
  if (user.role !== "admin") {
    return mockOrders.filter((order) => order.userId === user.id);
  }
  const query = getQuery(event);

  const userId = Number(query.userId);

  if (!userId) {
    return mockOrders;
  }

  return mockOrders.filter((order) => order.userId === userId);
});
