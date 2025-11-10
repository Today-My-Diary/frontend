import { useToastStore } from "@/stores/useToastStore";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_public/login-failure")({
  component: RouteComponent,
});

function RouteComponent() {
  const showToast = useToastStore((state) => state.show);

  useEffect(() => {
    showToast("로그인에 실패했습니다.", "error");
  }, [showToast]);

  return <Navigate to="/login" replace />;
}
