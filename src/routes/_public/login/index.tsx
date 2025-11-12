import FairyCharacter from "@/components/FairyCharacter";
import { Header } from "@/components/ui/header";
import { createFileRoute } from "@tanstack/react-router";
import google from "@/assets/icons/google_login.svg";
import { Tooltip } from "@/components/ui/tooltip";

export const Route = createFileRoute("/_public/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-background-primary flex h-screen w-full flex-col">
      <Header></Header>
      <main className="flex h-full grow flex-col items-center justify-center">
        <FairyCharacter size={100} />
        <h2 className="text-secondary mb-10 text-center text-3xl font-bold">
          5초 만에 시작하는 나만의 이야기
        </h2>
        <Tooltip className="animate-bounce">로그인 / 회원가입</Tooltip>
        <a
          href={`${import.meta.env.VITE_API_URL}/auth/google`}
          rel="noopener noreferrer"
        >
          <img src={google} alt="google-login" />
        </a>
      </main>
    </div>
  );
}
