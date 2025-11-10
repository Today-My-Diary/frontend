import { queryClient, queries } from "@/api";
import { useTokenStore } from "@/stores/useTokenStore";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const token = useTokenStore.getState().token;

    if (token) return;

    try {
      const accessToken = await queryClient.fetchQuery({
        ...queries.auth.reissue,
        retry: false,
      });

      if (accessToken) {
        useTokenStore.getState().authorize(accessToken);
        return; // 재발급 성공
      }
    } catch (error) {
      console.error("Token reissue failed:", error);
    }

    throw redirect({
      to: "/login",
      replace: true,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  // TODO: Fallback 추가
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Outlet />
    </Suspense>
  );
}
