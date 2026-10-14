import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { compileScript, parse } from "@vue/compiler-sfc";
import { buildSync, transformSync } from "esbuild";
import { computed, createSSRApp, h, reactive, ref, watch } from "vue";
import { renderToString } from "@vue/server-renderer";

const require = createRequire(import.meta.url);
const utilities = {};
for (const name of ["requestError", "orderDate"]) {
  const module = { exports: {} };
  const code = buildSync({ entryPoints: [`app/utils/${name}.ts`], bundle: true,
    platform: "node", format: "cjs", write: false }).outputFiles[0].text;
  new Function("module", "exports", code)(module, module.exports);
  utilities[`~/utils/${name}`] = module.exports;
}
const pageRequire = (name) => utilities[name] ?? require(name);
const product = { id: 1, name: "Product rendering test", price: 1000000, image: "/icon/placeholder.svg",
  category: "phone", description: "Product description", inStock: true, stock: 5, specs: {} };

async function renderPage(file, { data = null, status = "success", error = null, props = {} } = {}) {
  const { descriptor } = parse(readFileSync(new URL(file, import.meta.url), "utf8"), { filename: file });
  const script = compileScript(descriptor, { id: file, inlineTemplate: true });
  const code = transformSync(script.content, { loader: "ts", format: "cjs",
    define: { "import.meta.server": "true" } }).code;
  const result = { httpStatus: 200, meta: null };
  const mocks = {
    computed, ref, watch,
    useRoute: () => reactive({ params: { id: "1" } }),
    definePageMeta: () => {},
    useFetch: async () => ({ data: ref(data), status: ref(status), error: ref(error), refresh: async () => {} }),
    useAsyncData: async () => ({ data: ref(data), status: ref(status), error: ref(error), refresh: async () => {} }),
    useRequestFetch: () => async () => data,
    useAuth: () => ({ user: ref({ id: 1 }) }),
    useHead: () => {},
    useFormatPrice: () => ({ formatPrice: (value) => `${value} VND` }),
    useCart: () => ({ cart: ref([]), addToCart: () => {}, triggerToast: () => {} }),
    useSeoMeta: (meta) => { result.meta = meta; },
    useRequestEvent: () => ({}),
    setResponseStatus: (_event, code) => { result.httpStatus = code; },
    clearError: async () => {},
  };
  const module = { exports: {} };
  const component = new Function("require", "module", "exports", ...Object.keys(mocks),
    `${code}\nreturn module.exports.default;`)(pageRequire, module, module.exports, ...Object.values(mocks));
  const app = createSSRApp(component, props);
  app.component("NuxtLink", {
    props: ["to"],
    setup: (props, { slots }) => () => h("a", { href: props.to }, slots.default?.()),
  });
  result.html = await renderToString(app);
  return result;
}

const detailPage = "../app/pages/products/[id].vue";

test("order details distinguish 401/403/404/service errors and return matching SSR status without stale data", async () => {
  const stale = { id: 1, shippingInfo: { name: "PRIVATE_STALE_ORDER" }, items: [] };
  for (const [code, message, retry] of [
    [401, "Phiên đăng nhập đã hết hạn", false], [403, "Bạn không có quyền xem đơn hàng này", false],
    [404, "Không tìm thấy đơn hàng", false], [503, "Dịch vụ đơn hàng tạm thời gặp sự cố", true],
    [0, "Không thể kết nối để tải đơn hàng", true],
  ]) {
    const result = await renderPage("../app/pages/orders/[id].vue", {
      data: stale, status: "error", error: { statusCode: code, message: "INTERNAL_SECRET" },
    });
    assert.ok(result.html.includes(message));
    assert.equal(result.html.includes("Thử lại"), retry);
    assert.doesNotMatch(result.html, /PRIVATE_STALE_ORDER|INTERNAL_SECRET/);
    assert.equal(result.httpStatus, code || 503);
    if (code === 401) assert.match(result.html, /Đăng nhập lại/);
  }
});

test("order history provides retry for network failure and login recovery for expired sessions", async () => {
  for (const [code, expected] of [[0, "Thử lại"], [401, "Đăng nhập lại"]]) {
    const result = await renderPage("../app/pages/orders/index.vue", { data: [], status: "error", error: { statusCode: code } });
    assert.ok(result.html.includes(expected));
    assert.match(result.html, /role="alert"/);
    assert.doesNotMatch(result.html, /Bạn chưa có đơn hàng nào/);
  }
});

test("product success renders product data and dynamic SEO", async () => {
  const result = await renderPage(detailPage, { data: product });
  assert.match(result.html, /Product rendering test/);
  assert.match(result.html, /1000000 VND/);
  assert.match(result.html, /Thêm vào giỏ hàng/);
  assert.equal(result.meta.description(), product.description);
  assert.match(result.meta.title(), /Product rendering test/);
  assert.equal(result.httpStatus, 200);
});

test("pending product shows accessible loading instead of a false 404", async () => {
  const result = await renderPage(detailPage, { status: "pending" });
  assert.match(result.html, /Đang tải thông tin sản phẩm/);
  assert.match(result.html, /role="status"/);
  assert.match(result.html, /aria-busy="true"/);
  assert.doesNotMatch(result.html, /Không tìm thấy sản phẩm/);
});

test("missing product renders 404 and prevents indexing", async () => {
  const result = await renderPage(detailPage, { status: "error", error: { statusCode: 404 } });
  assert.match(result.html, /Không tìm thấy sản phẩm/);
  assert.doesNotMatch(result.html, /Chưa thể tải thông tin sản phẩm/);
  assert.equal(result.httpStatus, 404);
  assert.equal(result.meta.robots(), "noindex, nofollow");
});

test("API failure offers retry and hides stale product data", async () => {
  const result = await renderPage(detailPage, { data: product, status: "error", error: { statusCode: 503 } });
  assert.match(result.html, /Chưa thể tải thông tin sản phẩm/);
  assert.match(result.html, /Thử lại/);
  assert.doesNotMatch(result.html, /Không tìm thấy sản phẩm/);
  assert.doesNotMatch(result.html, /Product rendering test/);
  assert.equal(result.httpStatus, 503);
  assert.equal(result.meta.robots(), "noindex, nofollow");
});

test("global 404 provides recovery links without requiring application layout", async () => {
  const result = await renderPage("../app/error.vue", { props: { error: { statusCode: 404 } } });
  assert.match(result.html, /Không tìm thấy trang/);
  assert.match(result.html, /href="\/products"/);
  assert.match(result.html, /href="\/"/);
  assert.equal(result.meta.robots, "noindex, nofollow");
});

test("global server error hides internal error details", async () => {
  const result = await renderPage("../app/error.vue", { props: {
    error: { statusCode: 500, message: "INTERNAL_SECRET_STACK_TRACE" },
  } });
  assert.match(result.html, /Đã xảy ra sự cố/);
  assert.doesNotMatch(result.html, /INTERNAL_SECRET_STACK_TRACE/);
});
