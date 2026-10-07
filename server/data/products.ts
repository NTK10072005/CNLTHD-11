// server/data/products.ts

export interface Product {
  id: number;
  name: string;
  category: "phone" | "laptop" | "audio" | "accessory";
  price: number;
  inStock: boolean;
  stock: number;
  image: string;
  description: string;
  specs: Record<string, string>;
}

// Khai báo bằng "let" để sau này các API thêm/sửa/xóa của Admin có thể cập nhật trực tiếp vào mảng này
export let mockProducts: Product[] = [
  // ==================== NHÓM ĐIỆN THOẠI (PHONE) ====================
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra 256GB",
    category: "phone",
    price: 27990000,
    inStock: true,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
    description:
      "Khung viền Titan chuẩn hàng không vũ trụ, màn hình phẳng tích hợp bút S-Pen và trợ lý Galaxy AI.",
    specs: {
      "Màn hình": "6.8 inch, Dynamic AMOLED 2X, 120Hz",
      Chipset: "Snapdragon 8 Gen 3 for Galaxy",
      "Camera chính": "200 MP + 50 MP + 12 MP + 10 MP",
      "Dung lượng pin": "5.000 mAh, sạc nhanh 45W",
    },
  },
  {
    id: 2,
    name: "Apple iPhone 15 Pro 128GB",
    category: "phone",
    price: 24490000,
    inStock: true,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    description:
      "Thiết kế Titan siêu nhẹ với viền mỏng nhất từ trước đến nay, nút Action Button và cổng sạc USB-C.",
    specs: {
      "Màn hình": "6.1 inch, Super Retina XDR, ProMotion 120Hz",
      Chipset: "Apple A17 Pro (3nm)",
      "Camera chính": "48 MP, chống rung quang học thế hệ 2",
      "Cổng sạc": "USB Type-C (hỗ trợ USB 3 tốc độ 10Gbps)",
    },
  },
  {
    id: 3,
    name: "Xiaomi 14 5G 256GB (Chính hãng)",
    category: "phone",
    price: 18990000,
    inStock: false, // Dùng để test badge hết hàng
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    description:
      "Ống kính quang học Leica thế hệ mới, kích thước nhỏ gọn cầm nắm tối ưu cùng vi xử lý hàng đầu.",
    specs: {
      "Màn hình": "6.36 inch, AMOLED 1.5K, 120Hz",
      Chipset: "Qualcomm Snapdragon 8 Gen 3",
      Camera: "Ống kính Leica Summilux 50 MP",
      "Sạc nhanh": "HyperCharge 90W có dây",
    },
  },

  // ==================== NHÓM LAPTOP ====================
  {
    id: 4,
    name: "MacBook Pro 14 inch M3 Pro (18GB / 512GB)",
    category: "laptop",
    price: 49990000,
    inStock: true,
    stock: 4,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    description:
      "Hiệu năng đỉnh cao cho đồ họa và lập trình chuyên nghiệp với chip M3 Pro kiến trúc GPU thế hệ mới.",
    specs: {
      "Màn hình": "14.2 inch Liquid Retina XDR (3024 x 1964)",
      "Vi xử lý": "Apple M3 Pro (11 CPU, 14 GPU)",
      "Bộ nhớ RAM": "18GB Unified Memory",
      "Thời lượng pin": "Tối đa 18 giờ sử dụng liên tục",
    },
  },
  {
    id: 5,
    name: "Laptop Gaming ASUS ROG Zephyrus G14 OLED",
    category: "laptop",
    price: 38500000,
    inStock: true,
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    description:
      "Thiết kế nhôm nguyên khối siêu mỏng nhẹ, trang bị màn hình OLED ROG Nebula hiển thị xuất sắc.",
    specs: {
      "Màn hình": "14.0 inch 3K OLED, 120Hz, 0.2ms",
      "Vi xử lý": "AMD Ryzen 9 8945HS (tích hợp Ryzen AI)",
      "Card đồ họa": "NVIDIA GeForce RTX 4060 8GB GDDR6",
      "Trọng lượng": "1.50 kg",
    },
  },
  {
    id: 6,
    name: "Laptop Dell XPS 13 Plus 9320 Core i7",
    category: "laptop",
    price: 32900000,
    inStock: false, // Dùng để test badge hết hàng
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    description:
      "Tuyệt tác tối giản với hàng phím chức năng cảm ứng điện dung và touchpad vô hình chìm dưới mặt kính.",
    specs: {
      "Màn hình": "13.4 inch FHD+ InfinityEdge chống chói",
      "Vi xử lý": "Intel Core i7-1360P (12 nhân, 16 luồng)",
      "Bộ nhớ RAM": "16GB LPDDR5 6000MHz",
      "Ổ cứng": "512GB SSD NVMe PCIe Gen 4",
    },
  },

  // ==================== NHÓM ÂM THANH (AUDIO) ====================
  {
    id: 7,
    name: "Tai nghe Chụp tai Sony WH-1000XM5",
    category: "audio",
    price: 6990000,
    inStock: true,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    description:
      "Chống ồn chủ động hàng đầu với 2 bộ xử lý và 8 micro, tối ưu hóa âm thanh Hi-Res Audio không dây.",
    specs: {
      "Thời lượng pin": "30 giờ (bật ANC), 40 giờ (tắt ANC)",
      "Thời gian sạc": "3 phút sạc nhanh cho 3 giờ nghe",
      "Kết nối": "Bluetooth 5.2, hỗ trợ LDAC và đa điểm",
      "Trọng lượng": "250 gram",
    },
  },
  {
    id: 8,
    name: "Tai nghe Apple AirPods Pro Gen 2 (MagSafe USB-C)",
    category: "audio",
    price: 5490000,
    inStock: true,
    stock: 7,
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    description:
      "Vi xử lý H2 cải tiến, tính năng Âm thanh Thích ứng khử tiếng ồn theo ngữ cảnh môi trường sống.",
    specs: {
      "Thời lượng pin": "6 giờ nghe (30 giờ kèm hộp sạc)",
      "Kháng nước bụi": "Chuẩn IP54 cho cả tai nghe và hộp",
      "Tính năng": "Chống ồn chủ động gấp 2 lần, Xuyên âm",
      "Hộp sạc": "Cổng USB-C, tích hợp loa Find My tìm kiếm",
    },
  },
  {
    id: 9,
    name: "Loa Bluetooth Di động Marshall Emberton II",
    category: "audio",
    price: 3990000,
    inStock: true,
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    description:
      "Âm thanh đa hướng 360 độ True Stereophonic đặc trưng từ Marshall, thân vỏ cổ điển kháng nước bụi hoàn hảo.",
    specs: {
      "Thời lượng pin": "Hơn 30 giờ chơi nhạc liên tục",
      "Chuẩn chống nước": "IP67 chống bụi và ngâm nước",
      "Kết nối": "Bluetooth 5.1 (khoảng cách 10m)",
      "Tính năng": "Stack Mode kết nối chuỗi nhiều loa cùng lúc",
    },
  },

  // ==================== NHÓM PHỤ KIỆN (ACCESSORY) ====================
  {
    id: 10,
    name: "Bàn phím cơ Không dây Keychron K2 Pro",
    category: "accessory",
    price: 2150000,
    inStock: true,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    description:
      "Layout 75% gọn gàng hỗ trợ tùy biến phím qua QMK/VIA, mạch hotswap thay switch dễ dàng.",
    specs: {
      "Loại Switch": "Keychron K Pro Brown Switch",
      "Chất liệu Keycap": "PBT Double-shot OSA Profile",
      "Dung lượng pin": "4000 mAh (dùng đến 300 giờ không LED)",
      "Kết nối": "Bluetooth 5.1 (3 thiết bị) & Cáp Type-C",
    },
  },
  {
    id: 11,
    name: "Chuột Không dây Logitech MX Master 3S",
    category: "accessory",
    price: 2290000,
    inStock: true,
    stock: 9,
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    description:
      "Cảm biến Darkfield 8000 DPI hoạt động mượt cả trên mặt kính, nút bấm Quiet Click giảm tiếng ồn 90%.",
    specs: {
      "Độ phân giải": "200 đến 8000 DPI (tùy chỉnh 50 DPI mỗi bước)",
      "Con lăn": "MagSpeed cuộn điện từ 1000 dòng/giây",
      "Thời lượng pin": "Dùng đến 70 ngày sau một lần sạc đầy",
      "Kết nối": "Bluetooth Low Energy hoặc đầu thu Logi Bolt",
    },
  },
  {
    id: 12,
    name: "Củ sạc Nhanh Anker Prime 67W GaN (3 Cổng)",
    category: "accessory",
    price: 990000,
    inStock: false, // Dùng để test badge hết hàng
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    description:
      "Công nghệ GaNPrime thu gọn kích thước tối đa, phân phối điện năng thông minh cho cùng lúc 3 thiết bị.",
    specs: {
      "Tổng công suất": "67W Max",
      "Cổng kết nối": "2 cổng USB-C và 1 cổng USB-A",
      "Công nghệ": "PowerIQ 4.0 với Dynamic Power Distribution",
      "Cơ chế bảo vệ": "ActiveShield 2.0 kiểm soát nhiệt độ thời gian thực",
    },
  },
];
