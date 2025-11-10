import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useTokenStore } from "@/stores/useTokenStore";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  const { token } = useTokenStore();

  console.log(token);
  if (token) {
    return <Navigate to="/my" />;
  }

  return <Outlet />;
}
