import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { TodayWiredFilms } from "./-components/TodayWiredFilms";
import { RecordActionArea } from "./-components/RecordActionArea";
import { Calendar } from "./-components/Calendar";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import { mutations, queries } from "@/api";
import { useTokenStore } from "@/stores/useTokenStore";

export const Route = createFileRoute("/_auth/my/")({
  loader: async ({ context: { queryClient } }) => {
    const now = new Date();
    await queryClient.ensureQueryData(queries.videos.today);
    queryClient.prefetchQuery(
      queries.videos.calendar(now.getFullYear(), now.getMonth() + 1),
    );
  },
  pendingComponent: () => <Loading />,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data } = useSuspenseQuery(queries.videos.today);
  const { deauthorize } = useTokenStore();

  const { mutate: logout } = useMutation({
    ...mutations.auth.logout,
    onSuccess: () => {
      deauthorize();
      showToast({ type: "success", description: "로그아웃되었습니다." });
      navigate({ to: "/welcome" });
    },
  });

  const films = data.pastVideos.map((video) => ({
    id: video.videoId,
    date: video.uploadDate.toLocaleDateString("ko-KR"),
    title: video.timestamps[0]?.label || "소중한 이야기",
    thumbnailUrl: video.thumbnailS3Url,
  }));

  const handleFilmClick = (date: string) => navigate({ to: `/video/${date}` });

  return (
    <div className="bg-background-primary w-full">
      <Header>
        <Button variant="secondary" onClick={() => logout()}>
          로그아웃
        </Button>
      </Header>
      <main className="flex flex-col items-center gap-20 py-20">
        {data.todayVideoExists ? (
          data.pastVideos.length > 0 && (
            <TodayWiredFilms films={films} onClick={handleFilmClick} />
          )
        ) : (
          <RecordActionArea />
        )}
        <section className="text-secondary text-md flex w-full flex-col items-center gap-3 font-semibold">
          <div>나만의 필름 다이어리</div>
          <Calendar onClick={handleFilmClick} />
        </section>
      </main>
    </div>
  );
}
