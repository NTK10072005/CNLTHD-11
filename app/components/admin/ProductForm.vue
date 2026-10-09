<script setup lang="ts">
import type {
  Product,
  ProductCategory,
  ProductFormData,
} from "~/types/product";

const props = withDefaults(
  defineProps<{
    mode?: "create" | "edit";
    product?: Product | null;
    submitting?: boolean;
  }>(),
  {
    mode: "create",
    product: null,
    submitting: false,
  },
);

const emit = defineEmits<{
  submit: [data: ProductFormData];
  cancel: [];
}>();

const form = reactive<ProductFormData>({
  name: "",
  category: "phone",
  price: 0,
  inStock: false,
  stock: 0,
  image: "",
  description: "",
  specs: {},
});

const specKey = ref("");
const specValue = ref("");
const errorMessage = ref("");

function fillFormFromProduct() {
  if (!props.product) {
    return;
  }

  form.name = props.product.name;
  form.category = props.product.category;
  form.price = props.product.price;
  form.inStock = props.product.stock > 0;
  form.stock = props.product.stock;
  form.image = props.product.image;
  form.description = props.product.description;

  form.specs = {
    ...props.product.specs,
  };
}

watch(
  () => props.product,
  () => {
    fillFormFromProduct();
  },
  {
    immediate: true,
  },
);

function validateForm() {
  errorMessage.value = "";

  if (!form.name.trim()) {
    errorMessage.value = "Vui lòng nhập tên sản phẩm.";
    return false;
  }

  if (!Number.isFinite(form.price) || form.price <= 0) {
    errorMessage.value = "Giá sản phẩm phải là số hợp lệ lớn hơn 0.";
    return false;
  }

  if (!Number.isInteger(form.stock) || form.stock < 0) {
    errorMessage.value = "Số lượng tồn kho phải là số nguyên không âm.";
    return false;
  }

  if (!form.category) {
    errorMessage.value = "Vui lòng chọn danh mục.";
    return false;
  }

  if (!form.image.trim()) {
    errorMessage.value = "Vui lòng nhập URL hình ảnh.";
    return false;
  }

  if (!form.description.trim()) {
    errorMessage.value = "Vui lòng nhập mô tả sản phẩm.";
    return false;
  }

  return true;
}

function addSpec() {
  const key = specKey.value.trim();
  const value = specValue.value.trim();

  if (!key || !value) {
    return;
  }

  form.specs[key] = value;

  specKey.value = "";
  specValue.value = "";
}

function removeSpec(key: string) {
  delete form.specs[key];
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  emit("submit", {
    name: form.name.trim(),
    category: form.category,
    price: Number(form.price),
    inStock: Number(form.stock) > 0,
    stock: Number(form.stock),
    image: form.image.trim(),
    description: form.description.trim(),
    specs: {
      ...form.specs,
    },
  });
}

function handleCancel() {
  emit("cancel");
}

const categoryOptions: {
  value: ProductCategory;
  label: string;
}[] = [
  {
    value: "phone",
    label: "Điện thoại",
  },
  {
    value: "laptop",
    label: "Laptop",
  },
  {
    value: "audio",
    label: "Âm thanh",
  },
  {
    value: "accessory",
    label: "Phụ kiện",
  },
];
</script>

<template>
  <form
    class="space-y-6 rounded-xl bg-white p-6 shadow"
    @submit.prevent="handleSubmit"
  >
    <div>
      <h2 class="text-xl font-bold text-slate-900">
        {{ mode === "create" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm" }}
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        Nhập thông tin sản phẩm bên dưới.
      </p>
    </div>

    <div
      v-if="errorMessage"
      class="rounded-lg bg-red-50 p-4 text-sm text-red-700"
    >
      {{ errorMessage }}
    </div>

    <!-- Name -->
    <div>
      <label
        for="product-name"
        class="mb-2 block text-sm font-semibold text-slate-700"
      >
        Tên sản phẩm
      </label>

      <input
        id="product-name"
        v-model="form.name"
        type="text"
        placeholder="Ví dụ: iPhone 16 Pro Max"
        class="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Price -->
      <div>
        <label
          for="product-price"
          class="mb-2 block text-sm font-semibold text-slate-700"
        >
          Giá
        </label>

        <input
          id="product-price"
          v-model.number="form.price"
          type="number"
          min="0"
          step="1000"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
        />
      </div>

      <!-- Category -->
      <div>
        <label
          for="product-category"
          class="mb-2 block text-sm font-semibold text-slate-700"
        >
          Danh mục
        </label>

        <select
          id="product-category"
          v-model="form.category"
          class="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
        >
          <option
            v-for="option in categoryOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Stock -->
    <div>
      <label
        for="product-quantity"
        class="mb-2 block text-sm font-semibold text-slate-700"
      >
        Số lượng tồn kho
      </label>

      <input
        id="product-quantity"
        v-model.number="form.stock"
        type="number"
        min="0"
        step="1"
        class="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
      />
    </div>

    <!-- Stock status -->
    <div>
      <p class="mb-2 block text-sm font-semibold text-slate-700">
        Tình trạng hàng
      </p>

      <span
        v-if="Number(form.stock) > 0"
        class="inline-flex rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
      >
        Còn hàng
      </span>

      <span
        v-else
        class="inline-flex rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
      >
        Hết hàng
      </span>

      <p class="mt-2 text-xs text-slate-500">
        Tình trạng hàng được tự động xác định theo số lượng tồn kho.
      </p>
    </div>

    <!-- Image -->
    <div>
      <label
        for="product-image"
        class="mb-2 block text-sm font-semibold text-slate-700"
      >
        URL hình ảnh
      </label>

      <input
        id="product-image"
        v-model="form.image"
        type="text"
        placeholder="https://..."
        class="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
      />
    </div>

    <!-- Image preview -->
    <div v-if="form.image">
      <p class="mb-2 text-sm font-semibold text-slate-700">
        Xem trước hình ảnh
      </p>

      <img
        :src="form.image"
        :alt="form.name || 'Product preview'"
        class="h-40 w-40 rounded-lg border object-cover"
      />
    </div>

    <!-- Description -->
    <div>
      <label
        for="product-description"
        class="mb-2 block text-sm font-semibold text-slate-700"
      >
        Mô tả
      </label>

      <textarea
        id="product-description"
        v-model="form.description"
        rows="5"
        placeholder="Nhập mô tả sản phẩm..."
        class="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
      />
    </div>

    <!-- Specs -->
    <div>
      <div class="mb-3">
        <h3 class="font-semibold text-slate-800">Thông số kỹ thuật</h3>

        <p class="mt-1 text-sm text-slate-500">
          Ví dụ: RAM = 16GB, Storage = 512GB.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          v-model="specKey"
          type="text"
          placeholder="Tên thông số"
          class="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
        />

        <input
          v-model="specValue"
          type="text"
          placeholder="Giá trị"
          class="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
        />

        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-50"
          @click="addSpec"
        >
          Thêm
        </button>
      </div>

      <div v-if="Object.keys(form.specs).length > 0" class="mt-4 space-y-2">
        <div
          v-for="(value, key) in form.specs"
          :key="key"
          class="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
        >
          <div>
            <span class="font-semibold"> {{ key }}: </span>

            <span class="ml-2 text-slate-600">
              {{ value }}
            </span>
          </div>

          <button
            type="button"
            class="text-sm font-semibold text-red-600"
            @click="removeSpec(String(key))"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex justify-end gap-3 border-t pt-6">
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        @click="handleCancel"
      >
        Hủy
      </button>

      <button
        type="submit"
        :disabled="submitting"
        class="rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{
          submitting
            ? "Đang lưu..."
            : mode === "create"
              ? "Thêm sản phẩm"
              : "Lưu thay đổi"
        }}
      </button>
    </div>
  </form>
</template>
