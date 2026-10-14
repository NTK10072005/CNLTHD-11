export default defineNuxtRouteMiddleware(async () => {
  const { refreshUser } = useAuth();
  await refreshUser();
});
