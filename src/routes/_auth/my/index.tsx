import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TodayWiredFilms } from "./-components/TodayWiredFilms";
import { RecordActionArea } from "./-components/RecordActionArea";
import { Calendar } from "./-components/Calendar";
import { Header } from "@/components/ui/header";
import { Loading } from "@/components/Loading";
import { queries } from "@/api";
import { LogoutButton } from "@/components/LogoutButton";
import { getKSTDate, parseDate } from "@/lib/utils";

export const Route = createFileRoute("/_auth/my/")({
  loader: async ({ context: { queryClient } }) => {
    const now = getKSTDate();
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
  const { data } = useSuspenseQuery(queries.videos.today);

  const films = data.pastVideos.map((video) => ({
    id: video.videoId,
    date: parseDate(video.uploadDate),
    title: video.timestamps[0]?.label || "소중한 이야기",
    thumbnailUrl: video.thumbnailS3Url,
  }));

  const handleFilmClick = (date: string) => navigate({ to: `/video/${date}` });

  return (
    <div className="bg-background-primary min-h-screen w-full">
      <Header>
        <LogoutButton />
      </Header>
      <main className="flex flex-col items-center gap-20 py-20">
        {data.todayVideoExists ? (
          data.pastVideos.length > 0 && (
            <TodayWiredFilms films={films} onClick={handleFilmClick} />
          )
        ) : (
          <RecordActionArea />
        )}
        <section className="text-secondary text-md flex w-full flex-col items-center gap-3 px-4 font-semibold">
          <div>나만의 필름 다이어리</div>
          <Calendar onClick={handleFilmClick} />
        </section>
      </main>
    </div>
  );
}
