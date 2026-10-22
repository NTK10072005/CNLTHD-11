// app/composables/useCart.ts
import type { CartItem } from "~~/shared/types/cart";
import type { Product } from "~~/shared/types/product";
import { readStoredCart, writeStoredCart, reconcileCart } from "~/utils/cart";
export type { CartItem } from "~~/shared/types/cart";

// Timer toast dùng chung ở client; cờ khởi tạo giỏ được quản lý bằng useState.
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useCart = () => {
    // SSR-friendly state dùng chung toàn ứng dụng (Nuxt useState)
    const cart = useState<CartItem[]>('cart', () => []);
    const isCartInitialized = useState<boolean>('cart_initialized', () => false);

    // State thông báo toast toàn cục khi thêm sản phẩm
    const cartToast = useState<{ show: boolean; message: string; subMessage?: string }>('cart_toast', () => ({
        show: false,
        message: '',
        subMessage: '',
    }));

    // Kích hoạt toast thông báo và tự động ẩn sau 2.5s
    const triggerToast = (message: string, subMessage?: string) => {
        cartToast.value = { show: true, message, subMessage };
        if (import.meta.client) {
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                cartToast.value.show = false;
            }, 2500);
        }
    };

    // Chỉ đọc từ localStorage một lần duy nhất trên Client sau khi mount (tránh lỗi Hydration Mismatch)
    onMounted(() => {
        if (!isCartInitialized.value && import.meta.client) {
            isCartInitialized.value = true;
            // Truy cập chính localStorage cũng có thể ném SecurityError.
            try {
                if (cart.value.length === 0) cart.value = readStoredCart(localStorage);
            } catch {
                // Giữ giỏ trong bộ nhớ khi trình duyệt không cho truy cập storage.
            }
        }
    });

    // Tự động lưu localStorage mỗi khi giỏ hàng thay đổi (chỉ chạy ở client)
    const saveCart = () => {
        if (import.meta.client) {
            try {
                writeStoredCart(localStorage, cart.value);
            } catch {
                // Storage không khả dụng không được làm hỏng thao tác giỏ hàng.
            }
        }
    };

    const synchronizeCart = async () => {
        const snapshot = JSON.stringify(cart.value);
        // Lấy dữ liệu mới trực tiếp, không dùng payload/catalog đã cache trong Nuxt.
        const products = await $fetch<Product[]>('/api/products', { cache: 'no-store' });
        if (snapshot !== JSON.stringify(cart.value)) {
            throw new Error('Giỏ hàng vừa thay đổi. Vui lòng kiểm tra và thử lại.');
        }
        const result = reconcileCart(cart.value, products);
        cart.value = result.items;
        saveCart();
        return result.changes;
    };

    // Thêm vào giỏ
    const addToCart = (
        product: { id: number | string; name: string; price: number; image: string; stock?: number },
        quantity = 1
    ) => {
        const prodId = Number(product.id);
        const maxStock = product.stock ?? 99;
        if (!Number.isSafeInteger(prodId) || prodId <= 0 ||
            !Number.isSafeInteger(quantity) || quantity <= 0 ||
            !Number.isSafeInteger(product.price) || product.price <= 0 ||
            !Number.isSafeInteger(maxStock) || maxStock < 0) return false;
        const existing = cart.value.find((item) => Number(item.id) === prodId);

        if (existing) {
            const newTotal = existing.quantity + quantity;
            if (newTotal > maxStock) {
                triggerToast('Bạn không thể mua thêm sản phẩm này');
                return false;
            }
            existing.quantity = newTotal;
            existing.price = product.price;
            existing.name = product.name;
            existing.image = product.image;
            if (product.stock !== undefined) existing.stock = product.stock;
        } else {
            if (quantity > maxStock) {
                triggerToast('Bạn không thể mua thêm sản phẩm này');
                return false;
            }
            cart.value.push({
                id: prodId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
                stock: product.stock,
            });
        }
        saveCart();
        triggerToast('Đã thêm vào giỏ hàng!', `${product.name} (x${quantity})`);
        return true;
    };

    // Cập nhật số lượng
    const updateQuantity = (id: number | string, quantity: number) => {
        if (!Number.isSafeInteger(quantity)) return false;
        const targetId = Number(id);
        const item = cart.value.find((i) => Number(i.id) === targetId);
        if (item) {
            if (quantity <= 0) {
                removeFromCart(targetId);
            } else {
                const maxStock = item.stock ?? 99;
                if (quantity > maxStock) {
                    triggerToast('Bạn không thể mua thêm sản phẩm này');
                    return false;
                }
                item.quantity = quantity;
                saveCart();
                return true;
            }
        }
        return false;
    };

    // Xóa khỏi giỏ
    const removeFromCart = (id: number | string) => {
        const targetId = Number(id);
        cart.value = cart.value.filter((i) => Number(i.id) !== targetId);
        saveCart();
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = () => {
        cart.value = [];
        saveCart();
    };

    // Getters tính toán tự động
    const totalItems = computed(() =>
        cart.value.reduce((total, item) => total + item.quantity, 0)
    );

    const totalPrice = computed(() =>
        cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
    );

    return {
        cart,
        cartToast,
        triggerToast,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        synchronizeCart,
        totalItems,
        totalPrice,
    };
};
