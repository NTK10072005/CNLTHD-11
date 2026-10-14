import { randomBytes } from "node:crypto";
import {
  createError,
  deleteCookie,
  getCookie,
  setCookie,
  type H3Event,
} from "h3";
import { mockUsers, type User } from "../data/users";

const COOKIE_NAME = "shop-session";
const SESSION_TTL = 60 * 60 * 24; // 24 giờ

interface Session {
  userId: number;
  expiresAt: number;
}

// Session lưu ở server, phù hợp với dữ liệu mock hiện tại.
const sessions = new Map<string, Session>();

export function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function createServerSession(event: H3Event, userId: number) {
  const now = Date.now();

  // Dọn session đã hết hạn.
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }

  // Hủy session cũ trước khi cấp session mới.
  const oldToken = getCookie(event, COOKIE_NAME);
  if (oldToken) {
    sessions.delete(oldToken);
  }

  const token = randomBytes(32).toString("hex");

  sessions.set(token, {
    userId,
    expiresAt: now + SESSION_TTL * 1000,
  });

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
  deleteCookie(event, "auth-user", { path: "/" });
}

export function getSessionUser(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME);
  const session = token ? sessions.get(token) : undefined;

  if (!session || session.expiresAt <= Date.now()) {
    if (token) {
      sessions.delete(token);
    }

    deleteCookie(event, COOKIE_NAME, { path: "/" });

    return null;
  }

  const user = mockUsers.find((item) => item.id === session.userId);

  if (!user) {
    sessions.delete(token!);
    deleteCookie(event, COOKIE_NAME, { path: "/" });

    return null;
  }

  // Không trả mật khẩu cho nơi gọi.
  return toPublicUser(user);
}

export function requireUser(event: H3Event) {
  const user = getSessionUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Vui lòng đăng nhập." });
  }
  return user;
}

export function requireAdmin(event: H3Event) {
  const user = requireUser(event);

  if (user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Bạn không có quyền thực hiện thao tác này.",
    });
  }

  return user;
}

export function destroyServerSession(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME);

  if (token) {
    sessions.delete(token);
  }

  deleteCookie(event, COOKIE_NAME, { path: "/" });
  deleteCookie(event, "auth-user", { path: "/" });
}
