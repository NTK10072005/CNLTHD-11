import { getSessionUser } from "../../utils/auth";

export default defineEventHandler((event) => {
  return { user: getSessionUser(event) };
});
