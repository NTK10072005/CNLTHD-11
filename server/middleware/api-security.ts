import { createError, getHeader, getMethod, getRequestURL, setHeader } from "h3";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  if (!url.pathname.startsWith("/api/")) return;

  if (/^\/api\/(auth|orders|users)(\/|$)/.test(url.pathname)) {
    setHeader(event, "Cache-Control", "no-store");
  }

  if (["GET", "HEAD", "OPTIONS"].includes(getMethod(event))) return;

  const origin = getHeader(event, "origin");
  if (getHeader(event, "sec-fetch-site") === "cross-site" ||
      (origin && origin !== url.origin)) {
    throw createError({ statusCode: 403, statusMessage: "Request origin is not allowed." });
  }

  if (getMethod(event) !== "DELETE" &&
      getHeader(event, "content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    throw createError({ statusCode: 415, statusMessage: "Content-Type must be application/json." });
  }
});
