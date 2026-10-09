# SHOP ĐIỆN TỬ 11

## 1. Giới thiệu dự án

**Shop điện tử 11** là website bán hàng điện tử được xây dựng nhằm phục vụ nhu cầu tìm kiếm, lựa chọn và đặt mua các sản phẩm công nghệ trực tuyến.

Dự án được thực hiện trong khuôn khổ đồ án học phần của nhóm 11, tập trung vào việc xây dựng giao diện người dùng, xử lý nghiệp vụ bán hàng và quản lý cửa hàng.

Website gồm hai khu vực chính:

- **Khách hàng:** Xem sản phẩm, tìm kiếm, quản lý giỏ hàng và đặt hàng.
- **Quản trị viên (Admin):** Theo dõi hoạt động cửa hàng, quản lý sản phẩm, đơn hàng và khách hàng.

## 2. Công nghệ sử dụng

| Công nghệ        | Vai trò                                      |
| ---------------- | -------------------------------------------- |
| Nuxt 4           | Framework xây dựng ứng dụng web              |
| Vue 3            | Xây dựng giao diện và các component          |
| TypeScript       | Phát triển ứng dụng với kiểu dữ liệu rõ ràng |
| Tailwind CSS     | Thiết kế giao diện                           |
| Nitro Server API | Xử lý API phía server                        |
| Git và GitHub    | Quản lý mã nguồn                             |
| GitHub Actions   | Tự động kiểm tra và build project            |

## 3. Các chức năng chính

### 3.1. Khách hàng

- Xem danh sách và thông tin chi tiết sản phẩm.
- Tìm kiếm và lựa chọn sản phẩm.
- Thêm sản phẩm vào giỏ hàng.
- Cập nhật số lượng sản phẩm trong giỏ hàng.
- Đặt hàng và thanh toán khi nhận hàng (COD).
- Theo dõi thông tin và trạng thái đơn hàng.

### 3.2. Quản trị viên (Admin)

- Xem trang tổng quan quản trị.
- Xem và tìm kiếm danh sách sản phẩm.
- Thêm sản phẩm mới.
- Chỉnh sửa thông tin sản phẩm.
- Xóa sản phẩm.
- Quản lý số lượng tồn kho.
- Xem và tìm kiếm danh sách đơn hàng.
- Xác nhận, xử lý giao hàng, hoàn thành hoặc hủy đơn hàng.
- Xem và tìm kiếm thông tin khách hàng.

## 4. Cài đặt và chạy dự án

### Yêu cầu

- Node.js phiên bản 22.
- npm.
- Git (nếu tải project bằng lệnh clone).

### Bước 1: Tải mã nguồn

Clone repository từ GitHub hoặc tải mã nguồn dưới dạng file ZIP.

### Bước 2: Cài đặt thư viện

Mở Terminal tại thư mục gốc của project và chạy:

```bash
npm install
```

### Bước 3: Khởi động môi trường phát triển

```bash
npm run dev
```

Sau khi server khởi động, mở trình duyệt và truy cập:

http://localhost:3000

### Bước 4: Build project

Để kiểm tra khả năng build ứng dụng:

```bash
npm run build
```

## 5. Cấu trúc thư mục

```text
app/
├── components/       # Các component giao diện
├── pages/            # Các trang của website
│   └── admin/        # Các trang quản trị
├── layouts/          # Layout của ứng dụng
├── middleware/       # Middleware kiểm soát truy cập
└── types/            # Định nghĩa kiểu dữ liệu TypeScript

server/
├── api/              # Các API xử lý dữ liệu
└── data/             # Dữ liệu mock

.github/
└── workflows/
    └── ci.yml        # GitHub Actions CI

nuxt.config.ts        # Cấu hình Nuxt
package.json          # Thông tin và dependencies
README.md             # Tài liệu hướng dẫn dự án
```

## 6. Dữ liệu và lưu trữ

Dự án hiện sử dụng **mock data lưu trong bộ nhớ của server**, chưa kết nối với cơ sở dữ liệu lâu dài.

Dữ liệu mẫu được khai báo trong các file thuộc thư mục `server/data/`.

**Lưu ý:**

- Những dữ liệu có sẵn trong file mock vẫn tồn tại sau khi khởi động lại server.
- Các sản phẩm, đơn hàng và thay đổi được thực hiện trong lúc chạy ứng dụng có thể bị mất khi server khởi động lại.
- Dữ liệu sẽ được khôi phục về trạng thái khai báo ban đầu trong các file mock.

Cách tổ chức này phù hợp với mục tiêu phát triển và trình diễn các chức năng của đồ án.

## 7. Quy trình xử lý đơn hàng

Website hỗ trợ hình thức thanh toán **COD (thanh toán khi nhận hàng)**.

Trạng thái đơn hàng được xử lý theo quy trình:

```text
Chờ xác nhận
     ↓
Đã xác nhận
     ↓
Đang giao hàng
     ↓
Hoàn thành
```

Đơn hàng ở trạng thái **Chờ xác nhận** hoặc **Đã xác nhận** có thể được quản trị viên hủy.

Khi đơn hàng bị hủy, hệ thống hoàn lại số lượng tồn kho tương ứng.

## 8. Tích hợp liên tục (CI)

Dự án sử dụng **GitHub Actions** thông qua file:

```text
.github/workflows/ci.yml
```

Workflow được cấu hình để thực hiện các công việc:

1. Tải mã nguồn từ repository.
2. Thiết lập môi trường Node.js.
3. Cài đặt các thư viện cần thiết.
4. Kiểm tra kiểu dữ liệu TypeScript.
5. Build ứng dụng Nuxt.

Workflow được kích hoạt khi có thay đổi được push lên nhánh `main` hoặc khi tạo Pull Request vào nhánh `main`.

Có thể xem kết quả chạy CI trong tab **Actions** trên GitHub.

## 9. Thành viên thực hiện

**Nhóm 11**

3122410122-Nguyễn Văn Tầm Hoan
3123560044-Nguyễn Tuấn Kiệt
3121410234-Trần Gia Huy
3123410434-Trương Kim Vinh
