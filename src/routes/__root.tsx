import {
  createRootRouteWithContext,
  Outlet,
  useNavigate,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/config/env";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
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
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: "하루 필름 - 나만의 영상 일기",
      },
      {
        property: "og:description",
        content:
          "매일 매일을 영상 일기로 기록하고, 나만의 변화를 추적해보세요. 하루 필름과 함께라면 소중한 기억을 놓치지 않고 간직할 수 있습니다.",
      },
      {
        property: "og:image",
        content: "/og-image.png",
      },
    ],
  }),
  notFoundComponent: NotFoundComponent,
  errorComponent: GlobalErrorComponent,
});

function NotFoundComponent() {
  const navigate = useNavigate();
  return (
    <div className="bg-background-primary flex h-full w-full flex-col items-center justify-center gap-10">
      <h1 className="text-secondary text-2xl font-bold">
        페이지를 찾을 수 없습니다.
      </h1>
      <Button onClick={() => navigate({ to: "/" })}>← 돌아가기</Button>
    </div>
  );
}

function GlobalErrorComponent({ error, reset }: ErrorComponentProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-background-primary flex h-full w-full flex-col items-center justify-center gap-10">
      <h1 className="text-secondary text-2xl font-bold">
        오류가 발생했습니다.
      </h1>
      <p className="text-secondary-semilight text-center">
        {error.message || "알 수 없는 오류가 발생했습니다."}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} variant="secondary">
          다시 시도
        </Button>
        <Button onClick={() => navigate({ to: "/" })}>홈으로 이동</Button>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
      <ConfirmModal />
      {env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
