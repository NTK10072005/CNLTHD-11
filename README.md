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
npm ci
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

Checkout chỉ gửi `items: [{ id, quantity }]` và thông tin nhận hàng. API lấy người dùng từ session, gộp ID trùng, yêu cầu số lượng nguyên dương, lấy giá/tên/ảnh từ dữ liệu server và kiểm tra toàn bộ giỏ trước khi tạo đơn/trừ kho. Dữ liệu sai trả 400, sản phẩm không tồn tại trả 404, hết hàng hoặc vượt tồn kho trả 409; lỗi không làm thay đổi đơn hàng hay tồn kho. Thông tin sản phẩm trong đơn là bản chụp tại thời điểm mua.

Kiểm tra và trừ kho chạy liên tiếp, không có `await`, trong một tiến trình mock server. Khi dùng database hoặc nhiều instance, cần transaction để giữ tính nhất quán tồn kho. Chặn submit lặp ở checkout không thay thế cơ chế idempotency phía server.

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

1. Tải mã nguồn từ repository bằng `actions/checkout`.
2. Thiết lập Node.js 22 trên Ubuntu 24.04, cache npm theo `package-lock.json`.
3. Chạy `npm ci` để cài đúng các phiên bản trong lockfile, gồm dev dependencies.
4. Chạy `npm run typecheck`.
5. Chạy `npm run build` trước test API vì test này cần `.output/server/index.mjs`.
6. Chạy `npm run test:pages`, `npm run test:data` và `npm run test:auth`.

Workflow chạy khi push lên bất kỳ nhánh nào, mở/cập nhật Pull Request, hoặc bấm **Run workflow** trong tab Actions. Khi một bước thất bại, job thất bại và các bước phía sau không chạy. Run cũ cùng ref được hủy khi có run mới; thời hạn mỗi job là 15 phút.

Workflow chỉ cần quyền đọc repository và không cần secret cho dữ liệu mock. File workflow cần được commit/push cùng mã nguồn, tests, thư mục `shared/` và `package-lock.json`; các file chưa được Git theo dõi trên máy không xuất hiện trong runner.

Xem kết quả: vào repository trên GitHub → **Actions** → **Nuxt CI** → chọn run → mở job **Typecheck, build and tests**. Nếu run đỏ, mở bước thất bại để đọc log. Khi dùng làm minh chứng báo cáo, lưu URL run, commit SHA và ảnh các bước thành công. Cấu hình này không tự thiết lập quy tắc bắt buộc CI trước merge; nhóm có thể bật required status check trong ruleset/branch protection của repository.

Chạy các bước kiểm tra trên máy:

```bash
npm run typecheck
npm run build
npm run test:pages
npm run test:data
npm run test:auth
```

## 9. Xác thực và phân quyền

- Server lưu session và cấp cookie `shop-session` có `HttpOnly`, `SameSite=Lax`, thời hạn 24 giờ; cookie có `Secure` trong production. Khi triển khai production cần HTTPS.
- Cookie `auth-user` cũ không được dùng để xác thực. Giao diện gọi `GET /api/auth/me` để khôi phục người dùng khi SSR và điều hướng.
- `POST /api/auth/login` và `POST /api/auth/register` cấp session mới, hủy session cũ của trình duyệt. `POST /api/auth/logout` hủy session tại server.
- Mật khẩu được lưu bằng scrypt với salt riêng. Response không chứa mật khẩu hoặc hash. Tài khoản demo: `khachhang / password123`, `admin / admin123`; chỉ dùng cho trình diễn.
- Xem sản phẩm là công khai. API thêm/sửa/xóa sản phẩm, cập nhật trạng thái đơn và danh sách người dùng chỉ dành cho admin.
- Khách hàng chỉ xem được đơn của mình. API tạo đơn lấy `userId` từ session; query/body không thể đổi chủ sở hữu.
- Request thay đổi dữ liệu bị chặn khi đến từ origin khác; POST/PUT yêu cầu `application/json`. Các API auth/orders/users đặt `Cache-Control: no-store`.
- Session và dữ liệu vẫn lưu trong bộ nhớ, mất khi server khởi động lại. Nếu chạy nhiều instance cần kho session và dữ liệu dùng chung.

Chạy bộ kiểm thử trên bản build mới nhất (Node.js 22):

```bash
npm run build
npm run test:auth
```

Test tự khởi động một server riêng trên cổng trống, kiểm tra hash, cookie giả, 401/403, quyền admin, quyền sở hữu đơn, session rotation/logout và SSR. Các ca đặt hàng kiểm tra body/số lượng/thông tin nhận hàng sai, giá giả, gộp ID trùng, lỗi không trừ kho, hoàn kho khi hủy và hai request tranh sản phẩm cuối cùng. Dữ liệu test chỉ nằm trong tiến trình test. Bộ test này không thay thế kiểm tra kiểu TypeScript hoặc kiểm thử giao diện trên trình duyệt.

## 10. SSR, trạng thái tải và lỗi trang sản phẩm

- `app/pages/products/[id].vue` gọi `useFetch` với URL reactive và `lazy: true`: server vẫn lấy dữ liệu để render HTML/payload, còn điều hướng client có thể hiển thị trạng thái đang tải.
- Tách loading, lỗi tải có nút thử lại, sản phẩm không tồn tại và dữ liệu thành công. Lỗi 404 của API đặt HTTP status 404 cho document SSR; lỗi dịch vụ giữ HTTP status lỗi tương ứng. Trang lỗi không được index.
- ID sai định dạng bị chặn ở page bằng `definePageMeta.validate`; API trả 400 cho ID không hợp lệ và 404 cho ID hợp lệ nhưng không tồn tại.
- `app/error.vue` xử lý lỗi toàn ứng dụng, có liên kết gọi `clearError` để phục hồi. Trang này không phụ thuộc layout và không hiển thị stack/message nội bộ.
- `/error` trong `app/pages/error.vue` vẫn là route thông báo tìm kiếm hiện có, khác với trang lỗi toàn ứng dụng.

```bash
npm run build
npm run test:auth
npm run test:pages
```

`test:auth` kiểm tra HTTP status và HTML SSR thật. `test:pages` render Vue component với dữ liệu giả lập để kiểm tra loading, 404, lỗi dịch vụ, SEO và trang lỗi toàn cục. Để kiểm tra loading/retry trên trình duyệt, bật network throttling khi điều hướng từ danh sách; chặn request `/api/products/<id>` bằng DevTools, rồi bỏ chặn và bấm Thử lại.

## 11. Kiểu dữ liệu và kiểm tra TypeScript

- Product, CartItem và Order được định nghĩa tại `shared/types/`, dùng chung cho frontend/server. Các file `app/types/` re-export để giữ đường dẫn import hiện tại; server không phụ thuộc composable của Vue.
- ProductFormData được suy ra từ Product, bỏ `id` và `inStock`: server cấp ID và tính trạng thái còn hàng từ tồn kho. Trường `brand` chưa được triển khai trong dữ liệu/form nên không nằm trong hợp đồng hiện tại.
- API tạo/sửa sản phẩm dùng chung `server/utils/product.ts` để xác thực JSON lúc chạy. Giá là số nguyên VND dương, tồn kho là số nguyên không âm; không tự ép boolean/null/chuỗi thành số.
- Dev dependencies được pin: TypeScript 5.9.3, vue-tsc 3.3.12 và khai báo kiểu Node.js 22. Đây là bộ compiler đã được kiểm tra với project; TypeScript 7 trước đó gây lỗi truy cập `typescript/lib/tsc` của vue-tsc.

```bash
npm ci
npm run typecheck
npm run build
npm run test:auth
npm run test:pages
```

## 12. Lấy dữ liệu và làm mới sau thao tác

- Trang chủ, danh sách sản phẩm, dashboard và quản lý sản phẩm gọi `useProducts()`, dùng chung key `catalog-products` và cùng cấu hình fetch. Không gọi refresh sản phẩm trong `onMounted`; timer banner vẫn chạy ở client.
- Chi tiết sản phẩm dùng key reactive `product:<id>`. Danh sách đơn admin/dashboard chia sẻ `orders:admin`; lịch sử khách hàng dùng `orders:customer-<userId>`; chi tiết đơn dùng `order:<id>`.
- `useShopData()` làm mới theo nhóm key sau khi mutation thành công: tạo/sửa/xóa sản phẩm cập nhật catalog và chi tiết liên quan; đặt đơn cập nhật đơn hàng và tồn kho; hủy đơn cập nhật thêm các sản phẩm được hoàn kho. Đổi trạng thái đơn không ảnh hưởng tồn kho thì chỉ cập nhật đơn hàng.
- Checkout không gọi `refreshNuxtData()` toàn ứng dụng. Danh tính từ session và danh sách khách hàng không được refresh bởi các mutation này. Đây là cập nhật trong phiên ứng dụng hiện tại, không phải realtime giữa nhiều trình duyệt.

Kiểm thử bổ sung:

```bash
npm run test:data
```

Test dùng Vue renderer để mount trang chủ/danh sách với dữ liệu giả lập, xác nhận mount không gọi refresh thừa; kiểm tra các nhóm key được làm mới sau mutation. Test tích hợp kiểm tra HTML SSR sau sửa sản phẩm, đặt và hủy đơn.

Minh chứng SSR/hydration trên trình duyệt:

1. Mở trực tiếp `/products/1`, xem response document trong Network hoặc View Source: có tên/giá sản phẩm và `__NUXT_DATA__` trước khi JavaScript tiếp quản.
2. Mở trực tiếp `/` hoặc `/products`, lọc Fetch/XHR theo `/api/products`: hydration không có lệnh refresh sản phẩm bổ sung từ `onMounted`. Request `/api/auth/me` là kiểm tra session riêng.
3. Thêm sản phẩm vào giỏ sau hydration; quan sát số lượng giỏ cập nhật mà không tải lại document.
4. Trong cùng phiên admin, sửa sản phẩm rồi quay về danh sách/trang chủ; kiểm tra tên/giá mới. Đặt đơn rồi kiểm tra tồn kho; hủy đơn trong phiên admin rồi kiểm tra kho được hoàn.
5. Ghi rõ route, page, endpoint Nitro, key dữ liệu và ảnh Network/HTML trong báo cáo. `useFetch` đưa dữ liệu server vào payload để client dùng lại; `$fetch` được dùng cho thao tác submit.

## 13. Thành viên thực hiện

**Nhóm 11**

3122410122-Nguyễn Văn Tầm Hoan
3123560044-Nguyễn Tuấn Kiệt
3121410234-Trần Gia Huy
3123410434-Trương Kim Vinh
