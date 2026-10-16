import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";
import { createJiti } from "jiti";

test("session, password hashing and API permissions", { timeout: 60000 }, async (t) => {
  const jiti = createJiti(import.meta.url, { fsCache: false });
  const { hashPassword, verifyPassword } = await jiti.import("../server/utils/password.ts");
  const { mockUsers } = await jiti.import("../server/data/users.ts");

  await t.test("password hashes are salted, verified and never stored as plaintext", async () => {
    const first = await hashPassword("test-password");
    const second = await hashPassword("test-password");
    assert.notEqual(first, second);
    assert.equal(await verifyPassword("test-password", first), true);
    assert.equal(await verifyPassword("wrong-password", first), false);
    assert.equal(await verifyPassword("test-password", "invalid"), false);
    assert.ok(mockUsers.every((user) => !Object.hasOwn(user, "password")));
  });

  const listener = createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [".output/server/index.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, TZ: "UTC", NODE_ENV: "production", NITRO_HOST: "127.0.0.1", NITRO_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  server.stdout.on("data", (data) => { output += data; });
  server.stderr.on("data", (data) => { output += data; });
  const exited = once(server, "exit");

  async function request(path, { method = "GET", cookie, body, headers = {} } = {}) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { ...(cookie ? { Cookie: cookie } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
    });
    return { response, data: await response.json() };
  }
  function sessionCookie(response) {
    const cookie = response.headers.getSetCookie().find((value) => value.startsWith("shop-session="));
    assert.ok(cookie);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=Lax/i);
    return cookie.split(";")[0];
  }

  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error(output);
      try {
        if ((await fetch(`${base}/api/health`)).ok) { ready = true; break; }
      } catch {}
      await delay(100);
    }
    assert.ok(ready, output);

    await t.test("anonymous and forged cookies cannot access protected APIs", async () => {
      for (const [path, method, body] of [
        ["/api/users", "GET"], ["/api/orders", "GET"], ["/api/orders/1", "GET"],
        ["/api/products", "POST", {}], ["/api/products/1", "PUT", {}],
        ["/api/products/1", "DELETE"], ["/api/orders/1", "PUT", {}],
        ["/api/orders", "POST", {}],
      ]) {
        const result = await request(path, { method, body });
        assert.equal(result.response.status, 401, `${method} ${path}`);
      }
      const forged = `auth-user=${encodeURIComponent(JSON.stringify({ id: 2, role: "admin" }))}; shop-session=fake`;
      assert.equal((await request("/api/users", { cookie: forged })).response.status, 401);
      assert.equal((await request("/api/products")).response.status, 200);
    });

    let customerCookie;
    let adminCookie;
    await t.test("login validates password and restores identity from HttpOnly session", async () => {
      assert.equal((await request("/api/auth/login", { method: "POST", body: {
        username: "admin", password: "wrong-password",
      } })).response.status, 401);
      const login = await request("/api/auth/login", { method: "POST", body: {
        username: "khachhang", password: "password123",
      } });
      assert.equal(login.response.status, 200);
      customerCookie = sessionCookie(login.response);
      assert.equal(login.data.user.role, "user");
      assert.ok(!Object.hasOwn(login.data.user, "passwordHash"));
      const me = await request("/api/auth/me", { cookie: customerCookie });
      assert.equal(me.data.user.id, 1);
      assert.equal(me.response.headers.get("cache-control"), "no-store");
      const admin = await request("/api/auth/login", { method: "POST", body: {
        username: "admin", password: "admin123",
      } });
      assert.equal(admin.response.status, 200);
      adminCookie = sessionCookie(admin.response);
    });

    await t.test("customer cannot mutate admin resources or read user list", async () => {
      for (const [path, method, body] of [
        ["/api/users", "GET"], ["/api/products", "POST", {}],
        ["/api/products/1", "PUT", {}], ["/api/products/1", "DELETE"],
        ["/api/orders/1", "PUT", {}],
      ]) {
        assert.equal((await request(path, { method, body, cookie: customerCookie })).response.status, 403);
      }
      const users = await request("/api/users", { cookie: adminCookie });
      assert.equal(users.response.status, 200);
      assert.ok(users.data.every((user) => !Object.hasOwn(user, "passwordHash") && !Object.hasOwn(user, "password")));
    });

    let otherCookie;
    let orderId;
    await t.test("admin can create, update and delete products", async () => {
      const created = await request("/api/products", { method: "POST", cookie: adminCookie, body: {
        name: "Permission test", category: "phone", price: 1000000, stock: 2,
        image: "/icon/placeholder.svg", description: "Permission test", specs: {},
      } });
      assert.equal(created.response.status, 201);
      const id = created.data.product.id;
      assert.equal((await request(`/api/products/${id}`, { method: "PUT", cookie: adminCookie,
        body: { ...created.data.product, name: "Updated permission test" } })).response.status, 200);
      assert.equal((await request(`/api/products/${id}`, { method: "DELETE", cookie: adminCookie })).response.status, 200);
      assert.equal((await request(`/api/products/${id}`)).response.status, 404);
    });

    await t.test("product create/edit share validation and derive availability from stock", async () => {
      const data = { name: "  Product schema test  ", category: "phone", price: 1000000, stock: 0,
        image: "/icon/placeholder.svg", description: "Schema test", specs: {} };
      const created = await request("/api/products", { method: "POST", cookie: adminCookie,
        body: { ...data, inStock: true } });
      assert.equal(created.response.status, 201);
      const id = created.data.product.id;
      assert.equal(created.data.product.name, data.name.trim());
      assert.equal(created.data.product.inStock, false);
      const before = (await request(`/api/products/${id}`)).data;
      for (const body of [null, [], { ...data, price: true }, { ...data, price: "1000" },
        { ...data, price: 1.5 }, { ...data, stock: null }, { ...data, stock: 0.5 },
        { ...data, category: "invalid" }, { ...data, specs: { RAM: 16 } }]) {
        const allBefore = (await request("/api/products")).data;
        assert.equal((await request("/api/products", { method: "POST", cookie: adminCookie, body })).response.status, 400);
        assert.equal((await request(`/api/products/${id}`, { method: "PUT", cookie: adminCookie, body })).response.status, 400);
        assert.deepEqual((await request("/api/products")).data, allBefore);
        assert.deepEqual((await request(`/api/products/${id}`)).data, before);
      }
      const updated = await request(`/api/products/${id}`, { method: "PUT", cookie: adminCookie,
        body: { ...data, stock: 2, inStock: false } });
      assert.equal(updated.response.status, 200);
      assert.equal(updated.data.product.inStock, true);
      assert.equal(updated.data.product.stock, 2);
      assert.equal((await request(`/api/products/${id}`, { method: "DELETE", cookie: adminCookie })).response.status, 200);
    });

    await t.test("registration hashes password and ignores client-supplied admin role", async () => {
      const details = { username: "securitytest", email: "securitytest@example.com", name: "Test User",
        phone: "0901234567", address: "Test address", password: "registration123", role: "admin" };
      const registration = await request("/api/auth/register", { method: "POST", body: details });
      assert.equal(registration.response.status, 200);
      assert.equal(registration.data.user.role, "user");
      assert.ok(!Object.hasOwn(registration.data.user, "passwordHash"));
      const login = await request("/api/auth/login", { method: "POST", cookie: sessionCookie(registration.response), body: {
        username: details.username, password: details.password,
      } });
      assert.equal(login.response.status, 200);
      otherCookie = sessionCookie(login.response);
      assert.equal((await request("/api/users", { cookie: sessionCookie(registration.response) })).response.status, 401);
    });

    await t.test("orders use session owner and reject access by another customer", async () => {
      const products = (await request("/api/products")).data;
      const product = products.find((item) => item.stock > 0);
      const created = await request("/api/orders", { method: "POST", cookie: customerCookie, body: {
        userId: 2, items: [{ ...product, quantity: 1 }],
        shippingInfo: { name: "Session Owner", phone: "0901234567", address: "Test address" },
      } });
      assert.equal(created.response.status, 200);
      assert.equal(created.data.order.userId, 1);
      orderId = created.data.order.id;
      const list = await request("/api/orders?userId=2", { cookie: customerCookie });
      assert.ok(list.data.length > 0 && list.data.every((order) => order.userId === 1));
      assert.deepEqual((await request("/api/orders?userId=1", { cookie: otherCookie })).data, []);
      assert.equal((await request(`/api/orders/${orderId}`, { cookie: otherCookie })).response.status, 403);
      assert.equal((await request(`/api/orders/${orderId}`, { cookie: adminCookie })).response.status, 200);
      assert.equal((await request(`/api/orders/${orderId}`, { method: "PUT", cookie: adminCookie,
        body: { status: "confirmed" } })).response.status, 200);
    });

    const shippingInfo = { name: "Order Test", phone: "0901234567", address: "Test address" };
    async function createStockTestProduct(name, stock = 5) {
      const result = await request("/api/products", { method: "POST", cookie: adminCookie, body: {
        name, category: "phone", price: 1000000, stock,
        image: "/icon/placeholder.svg", description: "Product ID and stock regression test", specs: {},
      } });
      assert.equal(result.response.status, 201);
      return result.data.product;
    }

    await t.test("deleted highest product IDs are never reused, even after an invalid create", async () => {
      const first = await createStockTestProduct("Deleted highest ID");
      const remove = { method: "DELETE", cookie: adminCookie };
      assert.equal((await request(`/api/products/${first.id}`, remove)).response.status, 200);
      assert.equal((await request("/api/products", { method: "POST", cookie: adminCookie, body: {} })).response.status, 400);
      const second = await createStockTestProduct("New unique ID");
      assert.ok(second.id > first.id);
      assert.equal((await request(`/api/products/${first.id}`)).response.status, 404);
      assert.equal((await request(`/api/products/${second.id}`, remove)).response.status, 200);
      const third = await createStockTestProduct("Another unique ID");
      assert.ok(third.id > second.id);
      assert.equal((await request(`/api/products/${third.id}`, remove)).response.status, 200);
    });

    await t.test("pending/confirmed orders block deletion and concurrent cancellation restores only the original product once", async () => {
      const product = await createStockTestProduct("Reserved product");
      const created = await request("/api/orders", { method: "POST", cookie: customerCookie,
        body: { items: [{ id: product.id, quantity: 2 }], shippingInfo } });
      assert.equal(created.response.status, 200);
      const order = created.data.order;
      const remove = { method: "DELETE", cookie: adminCookie };
      const afterReservation = (await request(`/api/products/${product.id}`)).data;
      assert.equal(afterReservation.stock, 3);
      for (const status of ["pending", "confirmed"]) {
        if (status === "confirmed") {
          assert.equal((await request(`/api/orders/${order.id}`, { method: "PUT", cookie: adminCookie,
            body: { status } })).response.status, 200);
        }
        const denied = await request(`/api/products/${product.id}`, remove);
        assert.equal(denied.response.status, 409);
        assert.match(denied.data.message, /Không thể xóa sản phẩm/);
        assert.deepEqual((await request(`/api/products/${product.id}`)).data, afterReservation);
        assert.equal((await request(`/api/orders/${order.id}`, { cookie: adminCookie })).data.status, status);
      }
      const other = await createStockTestProduct("Unrelated product", 7);
      const cancel = { method: "PUT", cookie: adminCookie, body: { status: "cancelled" } };
      const results = await Promise.all([
        request(`/api/orders/${order.id}`, cancel), request(`/api/orders/${order.id}`, cancel),
      ]);
      assert.deepEqual(results.map((result) => result.response.status).sort(), [200, 400]);
      assert.equal((await request(`/api/products/${product.id}`)).data.stock, 5);
      assert.equal((await request(`/api/products/${other.id}`)).data.stock, 7);
      assert.equal((await request(`/api/products/${product.id}`, remove)).response.status, 200);
      const replacement = await createStockTestProduct("Replacement product", 9);
      assert.ok(replacement.id > other.id);
      assert.equal((await request(`/api/orders/${order.id}`, cancel)).response.status, 400);
      assert.equal((await request(`/api/products/${replacement.id}`)).data.stock, 9);
      assert.deepEqual((await request(`/api/orders/${order.id}`, { cookie: customerCookie })).data.items, order.items);
      for (const id of [other.id, replacement.id]) {
        assert.equal((await request(`/api/products/${id}`, remove)).response.status, 200);
      }
    });

    await t.test("shipping orders block deletion; completed orders permit it without losing order snapshots", async () => {
      const product = await createStockTestProduct("Shipping product", 2);
      const created = await request("/api/orders", { method: "POST", cookie: customerCookie,
        body: { items: [{ id: product.id, quantity: 1 }], shippingInfo } });
      assert.equal(created.response.status, 200);
      const order = created.data.order;
      for (const status of ["confirmed", "shipping"]) {
        assert.equal((await request(`/api/orders/${order.id}`, { method: "PUT", cookie: adminCookie,
          body: { status } })).response.status, 200);
      }
      const remove = { method: "DELETE", cookie: adminCookie };
      assert.equal((await request(`/api/products/${product.id}`, remove)).response.status, 409);
      assert.equal((await request(`/api/orders/${order.id}`, { method: "PUT", cookie: adminCookie,
        body: { status: "completed" } })).response.status, 200);
      assert.equal((await request(`/api/products/${product.id}`, remove)).response.status, 200);
      assert.equal((await request(`/api/products/${product.id}`)).response.status, 404);
      const snapshot = (await request(`/api/orders/${order.id}`, { cookie: customerCookie })).data;
      assert.equal(snapshot.status, "completed");
      assert.deepEqual(snapshot.items, order.items);
      assert.equal(snapshot.total, order.total);
    });

    await t.test("failed stock restoration leaves every product and the order unchanged", async () => {
      const first = await createStockTestProduct("Atomic restoration first");
      const second = await createStockTestProduct("Atomic restoration second");
      const created = await request("/api/orders", { method: "POST", cookie: customerCookie, body: {
        items: [{ id: first.id, quantity: 1 }, { id: second.id, quantity: 1 }], shippingInfo,
      } });
      assert.equal(created.response.status, 200);
      assert.equal((await request(`/api/products/${second.id}`, { method: "PUT", cookie: adminCookie,
        body: { ...second, stock: Number.MAX_SAFE_INTEGER } })).response.status, 200);
      const beforeProducts = (await request("/api/products")).data;
      const cancel = { method: "PUT", cookie: adminCookie, body: { status: "cancelled" } };
      assert.equal((await request(`/api/orders/${created.data.order.id}`, cancel)).response.status, 409);
      assert.deepEqual((await request("/api/products")).data, beforeProducts);
      assert.deepEqual((await request(`/api/orders/${created.data.order.id}`, { cookie: adminCookie })).data, created.data.order);
      assert.equal((await request(`/api/products/${second.id}`, { method: "PUT", cookie: adminCookie,
        body: { ...second, stock: 4 } })).response.status, 200);
      assert.equal((await request(`/api/orders/${created.data.order.id}`, cancel)).response.status, 200);
      for (const id of [first.id, second.id]) {
        assert.equal((await request(`/api/products/${id}`)).data.stock, 5);
        assert.equal((await request(`/api/products/${id}`, { method: "DELETE", cookie: adminCookie })).response.status, 200);
      }
    });

    async function assertRejectedWithoutChanges(body, expectedStatus = 400) {
      const beforeProducts = (await request("/api/products")).data;
      const beforeOrders = (await request("/api/orders", { cookie: adminCookie })).data;
      const result = await request("/api/orders", { method: "POST", cookie: customerCookie, body });
      assert.equal(result.response.status, expectedStatus, JSON.stringify(body));
      assert.deepEqual((await request("/api/products")).data, beforeProducts);
      assert.deepEqual((await request("/api/orders", { cookie: adminCookie })).data, beforeOrders);
    }

    await t.test("invalid order bodies, IDs, quantities and shipping never mutate stock or orders", async () => {
      const product = (await request("/api/products")).data.find((item) => item.stock > 0);
      for (const body of [null, [], 123, {}, { items: {} }, { items: [] },
        { items: [null], shippingInfo }, { items: [true], shippingInfo }]) {
        await assertRejectedWithoutChanges(body);
      }
      for (const quantity of [0, -1, 1.5, "1", null, true, Number.MAX_SAFE_INTEGER + 1]) {
        await assertRejectedWithoutChanges({ items: [{ id: product.id, quantity }], shippingInfo });
      }
      for (const id of [0, -1, 1.5, "invalid", true, null, Number.MAX_SAFE_INTEGER + 1]) {
        await assertRejectedWithoutChanges({ items: [{ id, quantity: 1 }], shippingInfo });
      }
      for (const shipping of [null, [], { ...shippingInfo, name: " " },
        { ...shippingInfo, name: "x".repeat(61) }, { ...shippingInfo, phone: 901234567 },
        { ...shippingInfo, phone: "12345" }, { ...shippingInfo, address: " " },
        { ...shippingInfo, address: "x".repeat(201) }, { ...shippingInfo, note: [] },
        { ...shippingInfo, note: "x".repeat(1001) }]) {
        await assertRejectedWithoutChanges({ items: [{ id: product.id, quantity: 1 }], shippingInfo: shipping });
      }
    });

    await t.test("missing, sold-out, overstock and duplicate overstock carts fail as a whole", async () => {
      const products = (await request("/api/products")).data;
      const product = products.find((item) => item.stock > 0);
      const soldOut = products.find((item) => item.stock === 0);
      await assertRejectedWithoutChanges({ items: [{ id: Number.MAX_SAFE_INTEGER, quantity: 1 }], shippingInfo }, 404);
      await assertRejectedWithoutChanges({ items: [{ id: soldOut.id, quantity: 1 }], shippingInfo }, 409);
      await assertRejectedWithoutChanges({ items: [{ id: product.id, quantity: product.stock + 1 }], shippingInfo }, 409);
      await assertRejectedWithoutChanges({ items: [
        { id: product.id, quantity: product.stock }, { id: String(product.id), quantity: 1 },
      ], shippingInfo }, 409);
      await assertRejectedWithoutChanges({ items: [
        { id: product.id, quantity: 1 }, { id: Number.MAX_SAFE_INTEGER, quantity: 1 },
      ], shippingInfo }, 404);
      await assertRejectedWithoutChanges({ items: [
        { id: product.id, quantity: 1 }, { id: soldOut.id, quantity: 1 },
      ], shippingInfo }, 409);
      await assertRejectedWithoutChanges({ items: [
        { id: product.id, quantity: Number.MAX_SAFE_INTEGER }, { id: product.id, quantity: 1 },
      ], shippingInfo });
    });

    await t.test("server prices merged items, normalizes shipping and cancellation restores stock once", async () => {
      const product = (await request("/api/products")).data.find((item) => item.stock >= 2);
      const created = await request("/api/orders", { method: "POST", cookie: customerCookie, body: {
        userId: 2,
        items: [
          { id: product.id, quantity: 1, price: 1, name: "Forged", image: "forged" },
          { id: String(product.id), quantity: 1, price: -500 },
        ],
        shippingInfo: { name: "  Order Test  ", phone: "090-123-4567", address: "  Test address  ", note: "  Note  " },
      } });
      assert.equal(created.response.status, 200);
      assert.equal(created.data.order.userId, 1);
      assert.deepEqual(created.data.order.items, [{ id: product.id, name: product.name,
        image: product.image, price: product.price, quantity: 2 }]);
      assert.equal(created.data.order.total, product.price * 2);
      assert.deepEqual(created.data.order.shippingInfo, { ...shippingInfo, note: "Note" });
      const remaining = (await request(`/api/products/${product.id}`)).data;
      assert.equal(remaining.stock, product.stock - 2);
      assert.equal(remaining.inStock, remaining.stock > 0);
      const cancel = { method: "PUT", cookie: adminCookie, body: { status: "cancelled" } };
      assert.equal((await request(`/api/orders/${created.data.order.id}`, cancel)).response.status, 200);
      assert.equal((await request(`/api/products/${product.id}`)).data.stock, product.stock);
      assert.equal((await request(`/api/orders/${created.data.order.id}`, cancel)).response.status, 400);
      assert.equal((await request(`/api/products/${product.id}`)).data.stock, product.stock);
    });

    await t.test("checkout price conflicts never create orders or deduct stock; current expected prices succeed", async () => {
      const product = await createStockTestProduct("Checkout price confirmation", 5);
      const items = [{ id: product.id, quantity: 1, expectedPrice: product.price }];
      assert.equal((await request(`/api/products/${product.id}`, { method: "PUT", cookie: adminCookie,
        body: { ...product, price: 1200000 } })).response.status, 200);
      await assertRejectedWithoutChanges({ items, shippingInfo }, 409);
      for (const expectedPrice of [null, true, "1200000", -1, 0, 1.5]) {
        await assertRejectedWithoutChanges({ items: [{ ...items[0], expectedPrice }], shippingInfo });
      }
      await assertRejectedWithoutChanges({ items: [
        { ...items[0], expectedPrice: 1200000 }, { ...items[0], expectedPrice: 1000000 },
      ], shippingInfo }, 409);
      const created = await request("/api/orders", { method: "POST", cookie: customerCookie,
        body: { items: [{ ...items[0], expectedPrice: 1200000, price: 1 }], shippingInfo } });
      assert.equal(created.response.status, 200);
      assert.equal(created.data.order.total, 1200000);
      assert.equal((await request(`/api/products/${product.id}`)).data.stock, 4);
      assert.equal((await request(`/api/orders/${created.data.order.id}`, { method: "PUT", cookie: adminCookie,
        body: { status: "cancelled" } })).response.status, 200);
      assert.equal((await request(`/api/products/${product.id}`, { method: "DELETE", cookie: adminCookie })).response.status, 200);
    });

    await t.test("simultaneous orders cannot both reserve the last unit in one server process", async () => {
      const product = (await request("/api/products", { method: "POST", cookie: adminCookie, body: {
        name: "Last unit", category: "phone", price: 1000000, stock: 1,
        image: "/icon/placeholder.svg", description: "Concurrent stock test", specs: {},
      } })).data.product;
      const beforeOrders = (await request("/api/orders", { cookie: adminCookie })).data.length;
      const options = { method: "POST", cookie: customerCookie,
        body: { items: [{ id: product.id, quantity: 1 }], shippingInfo } };
      const results = await Promise.all([request("/api/orders", options), request("/api/orders", options)]);
      assert.deepEqual(results.map((result) => result.response.status).sort(), [200, 409]);
      const remaining = (await request(`/api/products/${product.id}`)).data;
      assert.equal(remaining.stock, 0);
      assert.equal(remaining.inStock, false);
      assert.equal((await request("/api/orders", { cookie: adminCookie })).data.length, beforeOrders + 1);
      const successful = results.find((result) => result.response.status === 200);
      assert.equal((await request(`/api/orders/${successful.data.order.id}`, {
        method: "PUT", cookie: adminCookie, body: { status: "cancelled" },
      })).response.status, 200);
      assert.equal((await request(`/api/products/${product.id}`)).data.stock, 1);
      assert.equal((await request(`/api/products/${product.id}`, { method: "DELETE", cookie: adminCookie })).response.status, 200);
    });

    await t.test("SSR restores session, protects admin pages and forwards cookie to order API", async () => {
      assert.equal((await fetch(`${base}/admin`, { redirect: "manual" })).status, 302);
      const denied = await fetch(`${base}/admin`, { headers: { Cookie: customerCookie }, redirect: "manual" });
      assert.equal(denied.status, 302);
      assert.equal(denied.headers.get("location"), "/");
      const allowed = await fetch(`${base}/admin`, { headers: { Cookie: adminCookie } });
      assert.equal(allowed.status, 200);
      assert.match(await allowed.text(), /Quản Trị Viên Nhóm/);
      const order = await fetch(`${base}/orders/${orderId}`, { headers: { Cookie: customerCookie } });
      assert.equal(order.status, 200);
      const orderHtml = await order.text();
      assert.match(orderHtml, /Session Owner/);
      const { formatOrderDate } = await jiti.import("../app/utils/orderDate.ts");
      const orderData = (await request(`/api/orders/${orderId}`, { cookie: customerCookie })).data;
      const expectedDate = formatOrderDate(orderData.createdAt);
      assert.ok(orderHtml.includes(expectedDate), "detail SSR must render Vietnam time even when server runs in UTC");
      for (const [path, cookie] of [["/orders", customerCookie], ["/admin/orders", adminCookie]]) {
        const page = await fetch(`${base}${path}`, { headers: { Cookie: cookie } });
        assert.equal(page.status, 200);
        assert.ok((await page.text()).includes(expectedDate), `${path} must use the same order date format`);
      }
      const forbidden = await fetch(`${base}/orders/${orderId}`, { headers: { Cookie: otherCookie } });
      assert.equal(forbidden.status, 403);
      const forbiddenHtml = await forbidden.text();
      assert.match(forbiddenHtml, /Bạn không có quyền xem đơn hàng này/);
      assert.doesNotMatch(forbiddenHtml, /Session Owner/);
      const missing = await fetch(`${base}/orders/999999`, { headers: { Cookie: customerCookie } });
      assert.equal(missing.status, 404);
      assert.match(await missing.text(), /Không tìm thấy đơn hàng/);
      const invalid = await fetch(`${base}/orders/abc`, { headers: { Cookie: customerCookie } });
      assert.equal(invalid.status, 404);
    });

    await t.test("product SSR renders data, missing IDs return 404 and global 404 has recovery links", async () => {
      const htmlOptions = { headers: { Accept: "text/html" } };
      const product = (await request("/api/products/1")).data;
      const valid = await fetch(`${base}/products/1`, htmlOptions);
      assert.equal(valid.status, 200);
      const html = await valid.text();
      assert.match(html, new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.match(html, /__NUXT_DATA__/);
      for (const id of ["0", "abc", "-1", "1.5", "9007199254740992"]) {
        assert.equal((await request(`/api/products/${id}`)).response.status, 400);
        assert.equal((await fetch(`${base}/products/${id}`, htmlOptions)).status, 404);
      }
      const missing = await fetch(`${base}/products/999999`, htmlOptions);
      assert.equal(missing.status, 404);
      assert.match(await missing.text(), /Không tìm thấy sản phẩm/);
      const unknown = await fetch(`${base}/unknown-page-for-test`, htmlOptions);
      assert.equal(unknown.status, 404);
      const errorHtml = await unknown.text();
      assert.match(errorHtml, /Không tìm thấy trang/);
      assert.match(errorHtml, /href="\/products"/);
      assert.match(errorHtml, /noindex, nofollow/);
    });

    await t.test("SSR catalog and details reflect product edits, checkout stock and cancellation", async () => {
      const original = (await request("/api/products/7")).data;
      const edited = { ...original, name: "SSR refreshed catalog test", price: 1234000, stock: 2 };
      const htmlOptions = { headers: { Accept: "text/html" } };
      try {
        assert.equal((await request("/api/products/7", { method: "PUT", cookie: adminCookie, body: edited })).response.status, 200);
        for (const path of ["/", "/products", "/products/7"]) {
          const response = await fetch(`${base}${path}`, htmlOptions);
          assert.equal(response.status, 200);
          assert.match(await response.text(), /SSR refreshed catalog test/);
        }
        const created = await request("/api/orders", { method: "POST", cookie: customerCookie,
          body: { items: [{ id: 7, quantity: 2 }], shippingInfo } });
        assert.equal(created.response.status, 200);
        assert.equal(created.data.order.total, 2468000);
        const soldOut = await fetch(`${base}/products/7`, htmlOptions);
        assert.match(await soldOut.text(), /Tạm hết hàng/);
        assert.equal((await request(`/api/orders/${created.data.order.id}`, { method: "PUT", cookie: adminCookie,
          body: { status: "cancelled" } })).response.status, 200);
        const restored = await fetch(`${base}/products/7`, htmlOptions);
        assert.ok((await restored.text()).includes("Còn hàng trong kho (2 sản phẩm)"));
      } finally {
        assert.equal((await request("/api/products/7", { method: "PUT", cookie: adminCookie, body: original })).response.status, 200);
      }
    });

    await t.test("cross-origin mutations are rejected and logout invalidates old session", async () => {
      assert.equal((await request("/api/auth/logout", { method: "POST", cookie: customerCookie,
        body: {}, headers: { Origin: "https://untrusted.example" } })).response.status, 403);
      assert.equal((await request("/api/auth/logout", { method: "POST", cookie: customerCookie,
        body: {}, headers: { Origin: base } })).response.status, 200);
      assert.equal((await request("/api/auth/me", { cookie: customerCookie })).data.user, null);
      assert.equal((await request("/api/orders", { cookie: customerCookie })).response.status, 401);
    });
  } finally {
    server.kill();
    await exited;
  }
});
