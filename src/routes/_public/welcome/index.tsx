import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TitleArea } from "./-components/TitleArea";
import { QuestionAnimation } from "./-components/QuestionAnimation";
import { CTAArea } from "./-components/CTAArea";
import { CardArea } from "./-components/CardArea";
import { WiredFilms } from "@/components/WiredFilms";

export const Route = createFileRoute("/_public/welcome/")({
  component: RouteComponent,
});

const FILMS = [
  {
    id: "1",
    date: "2025.10.02(목)",
    title: "가장 맛있었던 음식들",
    thumbnailUrl: "/thumbnail_sample_1.png",
  },
  {
    id: "2",
    date: "2025.09.28(금)",
    title: "머릿속을 복잡하게 만드는 고민",
    thumbnailUrl: "/thumbnail_sample_2.png",
  },
  {
    id: "3",
    date: "2025.09.15(일)",
    title: "무심코 놓쳤던 주위의 풍경",
    thumbnailUrl: "/thumbnail_sample_3.png",
  },
];

function RouteComponent() {
  return (
    <div className="bg-background-primary min-h-screen w-full">
      <Header>
        <Link to="/login">
          <Button variant="primary">나만의 이야기 기록하기</Button>
        </Link>
      </Header>
      <main className="flex flex-col items-center gap-20 pt-10">
        <section className="flex w-full flex-col gap-20">
          <TitleArea />
          <div className="animate-in fade-in fill-mode-backwards delay-2000 duration-1000">
            <WiredFilms films={FILMS} />
          </div>
        </section>
        <section className="bg-secondary-light flex w-full flex-col gap-10 py-20">
          <QuestionAnimation />
          <CTAArea />
          <CardArea />
        </section>
      </main>
    </div>
  );
}
