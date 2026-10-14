export default defineNuxtRouteMiddleware(() => {
  const { user, sessionError } = useAuth();

  if (sessionError.value) {
    throw createError({ statusCode: 503, message: "Chưa thể kiểm tra phiên đăng nhập. Vui lòng thử lại." });
  }

  if (!user.value) {
    return navigateTo("/login");
  }
});
