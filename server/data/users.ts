// server/data/users.ts

export interface User {
  id: number;
  username: string;
  email: string;
  password: string; // Đối với mock data lưu mật khẩu trần để kiểm thử đăng nhập nhanh
  name: string;
  phone?: string;
  address?: string;
  role: "user" | "admin";
}

export let mockUsers: User[] = [
  {
    id: 1,
    username: "khachhang",
    email: "khachhang@techstore.vn",
    password: "password123",
    name: "Nguyễn Văn Khách",
    role: "user",
  },
  {
    id: 2,
    username: "admin",
    email: "admin@techstore.vn",
    password: "admin123",
    name: "Quản Trị Viên Nhóm",
    role: "admin",
  },
];
