import { destroyServerSession } from "../../utils/auth";

export default defineEventHandler((event) => {
  destroyServerSession(event);
  return { success: true };
});
