export interface AuthUser {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: "user" | "admin";
}

export interface RegisterDetails {
  username: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  password: string;
}

export function useAuth() {
  const user = useState<AuthUser | null>("auth-user", () => null);
  const sessionError = useState<string | null>("auth-session-error", () => null);
  const nuxtApp = useNuxtApp();
  // Giữ Nuxt context khi dọn cache sau một lời gọi async.
  const clearAuthData = () => nuxtApp.runWithContext(() => clearNuxtData());
  // Chuyển tiếp cookie request khi gọi API trong SSR.
  const requestFetch = useRequestFetch();

  async function refreshUser() {
    let response: { user: AuthUser | null };
    try {
      response = await requestFetch<{ user: AuthUser | null }>("/api/auth/me", { timeout: 8000, retry: 0 });
    } catch {
      // Lỗi dịch vụ không đồng nghĩa đã đăng xuất. Trang bảo vệ kiểm tra sessionError.
      sessionError.value = "Chưa thể kiểm tra phiên đăng nhập. Vui lòng thử lại trước khi dùng chức năng tài khoản.";
      return null;
    }
    if (user.value?.id !== response.user?.id) {
      clearAuthData();
    }
    user.value = response.user;
    sessionError.value = null;
    return response.user;
  }

  async function login(username: string, password: string) {
    const response = await $fetch<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });

    user.value = response.user;
    sessionError.value = null;
    clearAuthData();

    return response.user;
  }

  async function registerAccount(details: RegisterDetails) {
    const response = await $fetch<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: details,
    });

    user.value = response.user;
    sessionError.value = null;
    clearAuthData();

    return response.user;
  }

  async function logout() {
    await $fetch("/api/auth/logout", { method: "POST", body: {} });
    user.value = null;
    sessionError.value = null;
    // Xóa dữ liệu fetch của tài khoản cũ trước khi đổi tài khoản.
    clearAuthData();
  }

  return {
    user,
    sessionError,
    refreshUser,
    login,
    registerAccount,
    logout,
  };
}
