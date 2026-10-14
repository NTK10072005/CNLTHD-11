// server/data/users.ts

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
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
    passwordHash: "scrypt:32768:8:3:6ff9a21f1152ca524a7429501d57e42f:6ee098c1595a6eab932c00486e56581f098cad2aaad1831c9c3b67b3c845010184a22d6f6507c1ebfa9bc68a27159e05439a767c6fb53c74d814e87ed2e7a8e6",
    name: "Nguyễn Văn Khách",
    role: "user",
  },
  {
    id: 2,
    username: "admin",
    email: "admin@techstore.vn",
    passwordHash: "scrypt:32768:8:3:3dac14c2b2a5116079cbf4dcd98b3e80:26b5e3fed26967579123dbe8f249951d70669419de93cdd74db78edc9e9299f7697aa522ad6cb0509183a30025419e3295927e16a9fa788128683cf026866785",
    name: "Quản Trị Viên Nhóm",
    role: "admin",
  },
];
