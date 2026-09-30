// server/data/users.ts

export interface User {
  id: number;
  email: string;
  password: string; // Đối với mock data lưu mật khẩu trần để kiểm thử đăng nhập nhanh
  name: string;
  role: "user" | "admin";
}

export let mockUsers: User[] = [
  {
    id: 1,
    email: "khachhang@techstore.vn",
    password: "password123",
    name: "Nguyễn Văn Khách",
    role: "user",
  },
  {
    id: 2,
    email: "admin@techstore.vn",
    password: "admin123",
    name: "Quản Trị Viên Nhóm",
    role: "admin",
  },
];
