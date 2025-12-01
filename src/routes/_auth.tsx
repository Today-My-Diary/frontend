import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { queries } from "@/api";
import { useTokenStore } from "@/stores/useTokenStore";
import { useFCM } from "@/hooks/useFCM";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const token = useTokenStore.getState().token;

    if (token) {
      return;
    }

    try {
      const data = await queryClient.fetchQuery({
        ...queries.auth.reissue,
      });

      if (data?.accessToken) {
        useTokenStore.getState().authorize(data.accessToken);
        return;
      }
    } catch {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  useFCM({ withToastListener: true });
  return <Outlet />;
}
