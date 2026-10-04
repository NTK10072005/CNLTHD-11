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
  const authCookie = useCookie<AuthUser | null>("auth-user", {
    default: () => null,
  });

  const user = useState<AuthUser | null>("auth-user", () => authCookie.value);

  async function login(username: string, password: string) {
    const response = await $fetch<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });

    user.value = response.user;
    authCookie.value = response.user;

    return response.user;
  }

  async function registerAccount(details: RegisterDetails) {
    const response = await $fetch<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: details,
    });

    user.value = response.user;
    authCookie.value = response.user;

    return response.user;
  }

  function logout() {
    user.value = null;
    authCookie.value = null;
  }

  return {
    user,
    login,
    registerAccount,
    logout,
  };
}
