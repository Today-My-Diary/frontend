import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useToastStore } from "@/stores/useToastStore";
import { useEffect } from "react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "하루 필름 - 나만의 영상 일기",
      },
      {
        name: "description",
        content:
          "매일 매일을 영상 일기로 기록하고, 나만의 변화를 추적해보세요. 하루 필름과 함께라면 소중한 기억을 놓치지 않고 간직할 수 있습니다.",
      },
    ],
  }),
});

function RootComponent() {
  const { message, type } = useToastStore();
  const clearToast = useToastStore((state) => state.clear);

  useEffect(() => {
    if (message) {
      switch (type) {
        case "success":
          toast.success(message);
          break;
        case "error":
          toast.error(message);
          break;
        case "info":
          toast.info(message);
          break;
        default:
          toast(message);
      }

      clearToast();
    }
  }, [message, type, clearToast]);

  return (
    <>
      <Outlet />
      <Toaster />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
