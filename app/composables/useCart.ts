// app/composables/useCart.ts
export interface CartItem {
    id: number | string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

// Quản lý timer và cờ khởi tạo ở module scope để dùng chung đồng bộ toàn ứng dụng
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let isCartInitialized = false;

export const useCart = () => {
    // SSR-friendly state dùng chung toàn ứng dụng (Nuxt useState)
    const cart = useState<CartItem[]>('cart', () => []);

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
        if (!isCartInitialized && import.meta.client) {
            isCartInitialized = true;
            const saved = localStorage.getItem('nuxt_cart');
            if (saved && cart.value.length === 0) {
                try {
                    cart.value = JSON.parse(saved);
                } catch (e) {
                    console.error('Không thể đọc giỏ hàng từ localStorage', e);
                }
            }
        }
    });

    // Tự động lưu localStorage mỗi khi giỏ hàng thay đổi (chỉ chạy ở client)
    const saveCart = () => {
        if (import.meta.client) {
            localStorage.setItem('nuxt_cart', JSON.stringify(cart.value));
        }
    };

    // Thêm vào giỏ
    const addToCart = (product: { id: number | string; name: string; price: number; image: string }, quantity = 1) => {
        const existing = cart.value.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.value.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
            });
        }
        saveCart();
        triggerToast('Đã thêm vào giỏ hàng!', `${product.name} (x${quantity})`);
    };

    // Cập nhật số lượng
    const updateQuantity = (id: number | string, quantity: number) => {
        const item = cart.value.find((i) => i.id === id);
        if (item) {
            if (quantity <= 0) {
                removeFromCart(id);
            } else {
                item.quantity = quantity;
                saveCart();
            }
        }
    };

    // Xóa khỏi giỏ
    const removeFromCart = (id: number | string) => {
        cart.value = cart.value.filter((i) => i.id !== id);
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
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
    };
};
