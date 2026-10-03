// app/composables/useCart.ts
export interface CartItem {
    id: number | string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

export const useCart = () => {
    // SSR-friendly state dùng chung toàn ứng dụng
    const cart = useState<CartItem[]>('cart', () => []);

    // Chỉ đọc từ localStorage trên Client sau khi đã mount để tránh lỗi Hydration Mismatch
    onMounted(() => {
        const saved = localStorage.getItem('nuxt_cart');
        if (saved && cart.value.length === 0) {
            try {
                cart.value = JSON.parse(saved);
            } catch (e) {
                console.error('Không thể đọc giỏ hàng từ localStorage', e);
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

    // Xóa toàn bộ
    const clearCart = () => {
        cart.value = [];
        saveCart();
    };

    // Getters tính toán
    const totalItems = computed(() =>
        cart.value.reduce((total, item) => total + item.quantity, 0)
    );

    const totalPrice = computed(() =>
        cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
    );

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
    };
};
