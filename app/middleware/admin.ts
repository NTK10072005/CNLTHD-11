export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth();

  if (!user.value) {
    return navigateTo("/login");
  }

  if (user.value.role !== "admin") {
    return navigateTo("/");
  }
});
