import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const OPTIONS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return `scrypt:32768:8:3:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [algorithm, n, r, p, salt, digest, extra] = hash.split(":");
  if (algorithm !== "scrypt" || n !== "32768" || r !== "8" || p !== "3" ||
      !salt || !/^[a-f0-9]{32}$/.test(salt) || !digest ||
      !/^[a-f0-9]{128}$/.test(digest) || extra !== undefined) {
    return false;
  }
  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, Buffer.from(digest, "hex"));
}
