import { PRODUCT_LIST_KEY } from "./useProducts";

export function useShopData() {
  const nuxtApp = useNuxtApp();

  function refreshKeys(keys: string[]) {
    return nuxtApp.runWithContext(() => refreshNuxtData([...new Set(keys)]));
  }

  function refreshProducts(ids?: readonly (number | string)[]) {
    const details = Object.keys(nuxtApp.payload.data).filter((key) =>
      key.startsWith("product:") &&
      (!ids || ids.some((id) => Number(id) === Number(key.slice("product:".length)))),
    );
    return refreshKeys([PRODUCT_LIST_KEY, ...details]);
  }

  function refreshOrders(id?: number | string) {
    const keys = Object.keys(nuxtApp.payload.data).filter((key) =>
      key.startsWith("orders:") || (key.startsWith("order:") &&
        (id === undefined || Number(key.slice("order:".length)) === Number(id))),
    );
    // Chỉ làm mới các dữ liệu đơn hàng đã được đăng ký trong phiên này.
    return keys.length ? refreshKeys(keys) : Promise.resolve();
  }

  return { refreshProducts, refreshOrders };
}
