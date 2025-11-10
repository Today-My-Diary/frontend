import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/login-success")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to="/my" />;
}
