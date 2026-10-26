import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { compileScript, parse } from "@vue/compiler-sfc";
import { buildSync, transformSync } from "esbuild";
import { createRenderer, h, nextTick, reactive, ref, computed, watch, Suspense } from "vue";

const require = createRequire(import.meta.url);
const product = { id: 1, name: "Test product", category: "phone", price: 1000000,
  stock: 3, inStock: true, image: "/icon/placeholder.svg", description: "Test", specs: {} };

function loadErrorUtilities() {
  const module = { exports: {} };
  const code = buildSync({ entryPoints: ["app/utils/requestError.ts"], bundle: true,
    platform: "node", format: "cjs", write: false }).outputFiles[0].text;
  new Function("module", "exports", code)(module, module.exports);
  return module.exports;
}

test("auth error messages distinguish credentials, duplicates, validation, network and server errors", () => {
  const { authErrorMessage } = loadErrorUtilities();
  assert.match(authErrorMessage({ response: { status: 401 } }, "login"), /mật khẩu chưa chính xác/);
  assert.match(authErrorMessage({ data: { statusCode: 409 } }, "register"), /đã được sử dụng/);
  assert.equal(authErrorMessage({ statusCode: 400, data: { statusMessage: "Email không đúng định dạng." } }, "register"), "Email không đúng định dạng.");
  for (const action of ["login", "register", "logout"]) {
    assert.match(authErrorMessage(new Error("INTERNAL_NETWORK_DETAILS"), action), /Không thể kết nối/);
    const message = authErrorMessage({ statusCode: 500, data: { message: "SECRET_DATABASE_ERROR" } }, action);
    assert.match(message, /tạm thời gặp sự cố/);
    assert.doesNotMatch(message, /SECRET_DATABASE_ERROR|mật khẩu chưa chính xác|đã được sử dụng/);
  }
});

test("session failures preserve identity and public navigation while protected routes fail closed; recovery restores access", async () => {
  const states = new Map();
  const identity = { id: 2, role: "admin", name: "Session Tester" };
  let available = false;
  let cacheClears = 0;
  const module = { exports: {} };
  const code = buildSync({ entryPoints: ["app/composables/useAuth.ts"], bundle: true,
    platform: "node", format: "cjs", write: false }).outputFiles[0].text;
  const state = (key, init) => {
    if (!states.has(key)) states.set(key, ref(init()));
    return states.get(key);
  };
  new Function("module", "exports", "useState", "useNuxtApp", "clearNuxtData", "useRequestFetch", code)(
    module, module.exports, state, () => ({ runWithContext: (callback) => callback() }),
    () => { cacheClears++; }, () => async (_path, options) => {
      assert.equal(options.retry, 0);
      assert.equal(options.timeout, 8000);
      if (!available) throw new Error("Temporary network error");
      return { user: identity };
    },
  );
  const auth = module.exports.useAuth();
  auth.user.value = identity;
  function middleware(file) {
    const module = { exports: {} };
    const code = transformSync(readFileSync(file, "utf8"), { loader: "ts", format: "cjs" }).code;
    new Function("module", "exports", "defineNuxtRouteMiddleware", "useAuth", "createError", "navigateTo", code)(
      module, module.exports, (fn) => fn, () => auth,
      (input) => Object.assign(new Error(input.message), input), (path) => path,
    );
    return module.exports.default;
  }
  await middleware("app/middleware/session.global.ts")();
  assert.deepEqual(auth.user.value, identity);
  assert.ok(auth.sessionError.value);
  assert.equal(cacheClears, 0);
  for (const file of ["app/middleware/auth.ts", "app/middleware/admin.ts"]) {
    assert.throws(middleware(file), (error) => error.statusCode === 503);
  }
  available = true;
  await auth.refreshUser();
  assert.equal(auth.sessionError.value, null);
  assert.equal(middleware("app/middleware/admin.ts")(), undefined);
});

test("login/register forms show recoverable errors and allow resubmission without duplicate requests", async () => {
  const helpers = loadErrorUtilities();
  for (const [file, submit, action] of [
    ["../app/pages/login.vue", "submitLogin", "login"], ["../app/pages/register.vue", "submitRegistration", "registerAccount"],
  ]) {
    let failure = new Error("Network failure");
    let attempts = 0;
    const { descriptor } = parse(readFileSync(new URL(file, import.meta.url), "utf8"), { filename: file });
    const script = compileScript(descriptor, { id: file });
    const code = transformSync(script.content, { loader: "ts", format: "cjs" }).code;
    const module = { exports: {} };
    const component = new Function("require", "module", "exports", "useAuth", "useHead", "navigateTo",
      `${code}\nreturn module.exports.default;`)(
      (name) => name === "~/utils/requestError" ? helpers : require(name), module, module.exports,
      () => ({ [action]: async () => { attempts++; throw failure; } }), () => {}, async () => {},
    );
    const page = component.setup({}, { expose: () => {} });
    if (action === "login") {
      page.username.value = "khachhang";
      page.password.value = "password123";
    } else {
      Object.assign(page.form, { name: "Test User", username: "newtester", email: "test@example.com",
        phone: "0901234567", address: "Test address", password: "password123", confirmPassword: "password123" });
    }
    const pending = page[submit]();
    await page[submit]();
    await pending;
    assert.equal(attempts, 1);
    assert.match(page.errorMessage.value, /Không thể kết nối/);
    assert.equal(page.isSubmitting.value, false);
    failure = { statusCode: action === "login" ? 401 : 409 };
    await page[submit]();
    assert.equal(attempts, 2);
    assert.match(page.errorMessage.value, action === "login" ? /mật khẩu chưa chính xác/ : /đã được sử dụng/);
  }
});

test("order dates use identical Vietnam time across server and browser system timezones", () => {
  const code = buildSync({ entryPoints: ["app/utils/orderDate.ts"], bundle: true,
    platform: "node", format: "cjs", write: false }).outputFiles[0].text;
  const timestamps = ["2026-10-13T03:04:05.000Z", "2026-12-31T18:00:00.000Z",
    "2026-10-12T17:00:00.000Z", "2026-10-13T10:04:05+07:00"];
  const script = `const module = { exports: {} };\n${code}\nprocess.stdout.write(JSON.stringify(${JSON.stringify(timestamps)}.map(module.exports.formatOrderDate)));`;
  const expected = ["13/10/2026 10:04:05", "01/01/2027 01:00:00",
    "13/10/2026 00:00:00", "13/10/2026 10:04:05"];
  for (const timezone of ["UTC", "Asia/Ho_Chi_Minh", "America/New_York", "Asia/Tokyo"]) {
    const output = execFileSync(process.execPath, ["-e", script], {
      env: { ...process.env, TZ: timezone }, encoding: "utf8",
    });
    assert.deepEqual(JSON.parse(output), expected, timezone);
  }
});

test("invalid or timezone-less order dates have a stable fallback instead of crashing rendering", () => {
  const code = buildSync({ entryPoints: ["app/utils/orderDate.ts"], bundle: true,
    platform: "node", format: "cjs", write: false }).outputFiles[0].text;
  const module = { exports: {} };
  new Function("module", "exports", code)(module, module.exports);
  for (const value of ["", "invalid", "invalidZ", "2026-10-13", "2026-10-13T03:04:05", null, undefined]) {
    assert.equal(module.exports.formatOrderDate(value), "Không rõ thời gian");
  }
});

function createRefreshHarness(data) {
  const code = buildSync({ entryPoints: ["app/composables/useShopData.ts"], bundle: true,
    platform: "node", format: "cjs", write: false }).outputFiles[0].text;
  const calls = [];
  let inContext = false;
  const app = { payload: { data }, runWithContext(callback) {
    inContext = true;
    try { return callback(); } finally { inContext = false; }
  } };
  const module = { exports: {} };
  new Function("module", "exports", "useNuxtApp", "refreshNuxtData", code)(
    module, module.exports, () => app, async (keys) => {
      assert.equal(inContext, true, "refresh must run in captured Nuxt context");
      calls.push(keys);
    },
  );
  return { calls, refresh: module.exports.useShopData() };
}

test("product edits refresh catalog and affected detail without touching unrelated data", async () => {
  const { calls, refresh } = createRefreshHarness({ "catalog-products": [product],
    "product:1": product, "product:2": {}, "orders:admin": [], "admin-users-list": [] });
  await Promise.resolve(); // Simulate continuation after a mutation request.
  await refresh.refreshProducts(["1", 1]);
  assert.deepEqual(calls, [["catalog-products", "product:1"]]);
});

test("stock refresh can update all previously loaded product details", async () => {
  const { calls, refresh } = createRefreshHarness({ "product:1": product, "product:2": {}, "other": {} });
  await refresh.refreshProducts();
  assert.deepEqual(calls, [["catalog-products", "product:1", "product:2"]]);
});

test("order status updates refresh order lists and affected detail", async () => {
  const { calls, refresh } = createRefreshHarness({ "orders:admin": [], "orders:customer-1": [],
    "order:1": {}, "order:2": {}, "catalog-products": [], "admin-users-list": [] });
  await refresh.refreshOrders(1);
  assert.deepEqual(calls, [["orders:admin", "orders:customer-1", "order:1"]]);
});

test("no registered order data means no refresh request", async () => {
  const { calls, refresh } = createRefreshHarness({ "catalog-products": [] });
  await refresh.refreshOrders(1);
  assert.deepEqual(calls, []);
});

async function mountWithPayload(file) {
  const { descriptor } = parse(readFileSync(new URL(file, import.meta.url), "utf8"), { filename: file });
  const script = compileScript(descriptor, { id: file });
  const code = transformSync(script.content, { loader: "ts", format: "cjs",
    define: { "import.meta.client": "true", "import.meta.server": "false" } }).code;
  const calls = { products: 0, refresh: 0 };
  const mocks = {
    ref, reactive, computed, watch,
    useProducts: async () => {
      calls.products++;
      return { data: ref([product]), status: ref("success"), error: ref(null),
        refresh: async () => { calls.refresh++; } };
    },
    useRoute: () => reactive({ params: {}, query: {} }),
    useRouter: () => ({ replace: async () => {} }),
    useCart: () => ({ cartToast: ref({ show: false }) }),
    useSeoMeta: () => {},
    navigateTo: async () => {},
  };
  const module = { exports: {} };
  const component = new Function("require", "module", "exports", ...Object.keys(mocks),
    `${code}\nreturn module.exports.default;`)(require, module, module.exports, ...Object.values(mocks));
  component.render = () => h("div");
  const renderer = createRenderer({
    createElement: (tag) => ({ tag, children: [], parent: null }),
    createText: (text) => ({ text, parent: null }),
    createComment: (text) => ({ text, parent: null }),
    insert(node, parent, anchor) {
      if (node.parent) {
        const oldIndex = node.parent.children.indexOf(node);
        if (oldIndex >= 0) node.parent.children.splice(oldIndex, 1);
      }
      node.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      if (index >= 0) parent.children.splice(index, 0, node);
      else parent.children.push(node);
    },
    remove(node) {
      if (node.parent) {
        const index = node.parent.children.indexOf(node);
        if (index >= 0) node.parent.children.splice(index, 1);
        node.parent = null;
      }
    },
    setText: (node, text) => { node.text = text; },
    setElementText: (node, text) => { node.text = text; },
    parentNode: (node) => node.parent,
    nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
    patchProp: () => {},
  });
  const app = renderer.createApp({ render: () => h(Suspense, null, { default: () => h(component) }) });
  try {
    app.mount({ children: [] });
    await new Promise((resolve) => setImmediate(resolve));
    await nextTick();
    assert.equal(calls.products, 1);
    assert.equal(calls.refresh, 0, "mount must reuse fetched data without an extra refresh");
  } finally {
    app.unmount();
  }
}

test("home mount does not refetch products after receiving payload", () => mountWithPayload("../app/pages/index.vue"));
test("catalog mount does not refetch products after receiving payload", () => mountWithPayload("../app/pages/products/index.vue"));

function createCartHarness({ saved = null, storageError = false, fetchProducts = async () => [product] } = {}) {
  const module = { exports: {} };
  const states = new Map();
  const mounted = [];
  let stored = saved;
  const storage = {
    getItem() { if (storageError) throw new Error("Storage blocked"); return stored; },
    setItem(key, value) { if (storageError) throw new Error("Storage full"); stored = value; },
  };
  const code = buildSync({ entryPoints: ["app/composables/useCart.ts"], bundle: true,
    platform: "node", format: "cjs", write: false, alias: { "~": `${process.cwd()}/app` },
    define: { "import.meta.client": "true", "import.meta.server": "false" } }).outputFiles[0].text;
  new Function("module", "exports", "useState", "computed", "onMounted", "localStorage", "$fetch", "setTimeout", "clearTimeout", code)(
    module, module.exports, (key, init) => {
      if (!states.has(key)) states.set(key, ref(init()));
      return states.get(key);
    }, computed, (callback) => mounted.push(callback), storage, fetchProducts, () => 1, () => {},
  );
  const cart = module.exports.useCart();
  mounted.forEach((callback) => callback());
  return { cart, stored: () => stored };
}

test("stored cart rejects malformed JSON, non-arrays, invalid entries and duplicate IDs", () => {
  const valid = { id: "1", name: "Test product", image: product.image, price: product.price, quantity: 2 };
  for (const saved of ["{invalid", "{}", "null", "123"]) {
    const { cart } = createCartHarness({ saved });
    assert.deepEqual(cart.cart.value, []);
    assert.equal(cart.totalPrice.value, 0);
  }
  const invalid = [null, [], { ...valid, id: true }, { ...valid, id: "1.5" },
    { ...valid, quantity: "2" }, { ...valid, quantity: -1 }, { ...valid, quantity: 1.5 },
    { ...valid, price: "1000" }, { ...valid, price: 0 }, { ...valid, stock: -1 },
    { ...valid, price: Number.MAX_SAFE_INTEGER, quantity: 2 }];
  const { cart } = createCartHarness({ saved: JSON.stringify([...invalid, valid, valid]) });
  assert.deepEqual(cart.cart.value, [{ ...valid, id: 1 }]);
  assert.equal(cart.totalPrice.value, 2000000);
});

test("blocked storage does not break adding, updating or clearing an in-memory cart", () => {
  const { cart } = createCartHarness({ storageError: true });
  assert.equal(cart.addToCart(product, 1), true);
  assert.equal(cart.updateQuantity(1, 2), true);
  assert.equal(cart.totalItems.value, 2);
  assert.equal(cart.totalPrice.value, 2000000);
  assert.equal(cart.updateQuantity(1, 1.5), false);
  assert.equal(cart.addToCart(product, NaN), false);
  cart.clearCart();
  assert.deepEqual(cart.cart.value, []);
});

test("cart refresh updates prices/metadata, clamps quantities and removes unavailable products", async () => {
  const old = { ...product, quantity: 3 };
  const deleted = { ...old, id: 2, name: "Deleted" };
  const soldOut = { ...old, id: 3, name: "Sold out" };
  const current = { ...product, price: 1200000, stock: 2, name: "Updated name", image: "/new.svg" };
  const { cart, stored } = createCartHarness({ saved: JSON.stringify([old, deleted, soldOut]),
    fetchProducts: async () => [current, { ...product, id: 3, stock: 0, inStock: false }] });
  const changes = await cart.synchronizeCart();
  assert.equal(changes.length, 4);
  assert.deepEqual(cart.cart.value, [{ id: 1, name: current.name, image: current.image,
    price: 1200000, stock: 2, quantity: 2 }]);
  assert.equal(cart.totalPrice.value, 2400000);
  assert.deepEqual(JSON.parse(stored()), cart.cart.value);
  assert.deepEqual(await cart.synchronizeCart(), []);
});

test("failed catalog requests and edits during a refresh never overwrite the user's cart", async () => {
  const { cart } = createCartHarness({ saved: JSON.stringify([{ ...product, quantity: 1 }]),
    fetchProducts: async () => { throw new Error("Network unavailable"); } });
  const before = JSON.stringify(cart.cart.value);
  await assert.rejects(cart.synchronizeCart(), /Network unavailable/);
  assert.equal(JSON.stringify(cart.cart.value), before);
  let resolveProducts;
  const pending = createCartHarness({ saved: JSON.stringify([{ ...product, quantity: 1 }]),
    fetchProducts: () => new Promise((resolve) => { resolveProducts = resolve; }) });
  const refresh = pending.cart.synchronizeCart();
  pending.cart.clearCart();
  resolveProducts([product]);
  await assert.rejects(refresh, /Giỏ hàng vừa thay đổi/);
  assert.deepEqual(pending.cart.cart.value, []);
});

function createCheckoutHarness(cart) {
  const file = "../app/pages/checkout.vue";
  const { descriptor } = parse(readFileSync(new URL(file, import.meta.url), "utf8"), { filename: file });
  const script = compileScript(descriptor, { id: file });
  const code = transformSync(script.content, { loader: "ts", format: "cjs" }).code;
  const orders = [];
  const navigations = [];
  const mocks = {
    ref, reactive,
    useCart: () => cart,
    useAuth: () => ({ user: ref({ id: 1, name: "Cart Tester", phone: "0901234567", address: "Test address" }) }),
    useShopData: () => ({ refreshProducts: async () => {}, refreshOrders: async () => {} }),
    definePageMeta: () => {}, useHead: () => {},
    navigateTo: async (path) => { navigations.push(path); },
    $fetch: async (path, options) => { orders.push(options.body); return { order: { id: 1 } }; },
    console: { error: () => {} },
  };
  const module = { exports: {} };
  const component = new Function("require", "module", "exports", ...Object.keys(mocks),
    `${code}\nreturn module.exports.default;`)(require, module, module.exports, ...Object.values(mocks));
  return { page: component.setup({}, { expose: () => {} }), orders, navigations };
}

test("checkout stops after a price change and submits the revised price only on a second confirmation", async () => {
  const { cart } = createCartHarness({ saved: JSON.stringify([{ ...product, quantity: 2 }]),
    fetchProducts: async () => [{ ...product, price: 1200000 }] });
  const { page, orders, navigations } = createCheckoutHarness(cart);
  await page.placeOrder();
  assert.equal(orders.length, 0);
  assert.equal(page.cartChanges.value.length, 1);
  assert.equal(cart.totalPrice.value, 2400000);
  assert.equal(page.isSubmitting.value, false);
  await page.placeOrder();
  assert.equal(orders.length, 1);
  assert.deepEqual(orders[0].items, [{ id: 1, quantity: 2, expectedPrice: 1200000 }]);
  assert.deepEqual(navigations, ["/orders/1"]);
  assert.deepEqual(cart.cart.value, []);
});

test("checkout preserves cart and creates no order when fresh prices cannot be fetched", async () => {
  const { cart } = createCartHarness({ saved: JSON.stringify([{ ...product, quantity: 1 }]),
    fetchProducts: async () => { throw new Error("Network unavailable"); } });
  const { page, orders } = createCheckoutHarness(cart);
  await page.placeOrder();
  assert.equal(orders.length, 0);
  assert.equal(cart.cart.value.length, 1);
  assert.match(page.errorMessage.value, /Network unavailable/);
  assert.equal(page.isSubmitting.value, false);
});
