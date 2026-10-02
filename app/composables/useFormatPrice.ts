// app/composables/useFormatPrice.ts
export const useFormatPrice = () => {
    const formatPrice = (price: number | undefined | null): string => {
        if (price === undefined || price === null || isNaN(price)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return {
        formatPrice,
    };
};
