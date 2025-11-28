import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTokenStore } from "@/stores/useTokenStore";
import { queries } from "@/api";
import { FairyCharacter } from "@/components/FairyCharacter";
import { Header } from "@/components/ui/header";
import google from "@/assets/icons/google_login.svg";
import { Tooltip } from "@/components/ui/tooltip";
import { env } from "@/config/env";
import { z } from "zod";
import { useEffect } from "react";
import { useToast } from "@/hooks/useToast";

export const Route = createFileRoute("/_public/login/")({
  validateSearch: z.object({
    noSession: z.boolean().optional(),
  }),
  beforeLoad: async ({ context: { queryClient } }) => {
    const token = useTokenStore.getState().token;

    if (token) {
      throw redirect({ to: "/my", replace: true });
    }

    try {
      const data = await queryClient.fetchQuery({
        ...queries.auth.reissue,
        retry: 0,
      });
      if (data?.accessToken) {
        useTokenStore.getState().authorize(data.accessToken);
        throw redirect({ to: "/my", replace: true });
      }
    } catch {
      // Nothing
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { noSession } = Route.useSearch();
  const { showToast } = useToast();

  useEffect(() => {
    if (noSession) {
      showToast({
        description: "세션이 만료되었습니다. 다시 로그인해주세요.",
        type: "error",
      });
    }
  }, [noSession, showToast]);

  return (
    <div className="bg-background-primary flex h-screen w-full flex-col">
      <Header />
      <main className="flex h-full grow flex-col items-center justify-center">
        <FairyCharacter size={100} />
        <h2 className="text-secondary mb-10 text-center text-2xl font-bold md:text-3xl">
          5초 만에 시작하는 나만의 이야기
        </h2>
        <Tooltip className="animate-bounce">로그인 / 회원가입</Tooltip>
        <a href={`${env.VITE_API_URL}/auth/google`} rel="noopener noreferrer">
          <img src={google} alt="google-login" />
        </a>
      </main>
    </div>
  );
}
