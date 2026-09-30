// server/middleware/logger.ts
export default defineEventHandler((event) => {
  // Ghi log phương thức (GET, POST...) và URL request tới server Nitro
  console.log(
    `[Nitro Log] ${getMethod(event)} - ${getRequestURL(event).pathname}`,
  );
});
