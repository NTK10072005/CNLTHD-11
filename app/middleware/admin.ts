export default defineNuxtRouteMiddleware(() => {
  const { user, sessionError } = useAuth();

  if (sessionError.value) {
    throw createError({ statusCode: 503, message: "Chưa thể kiểm tra quyền truy cập. Vui lòng thử lại." });
  }

  if (!user.value) {
    return navigateTo("/login");
  }

  if (user.value.role !== "admin") {
    return navigateTo("/");
  }
});
