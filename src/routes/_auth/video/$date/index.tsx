import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { mutations, queries } from "@/api";
import { useTokenStore } from "@/stores/useTokenStore";
import { useToast } from "@/hooks/useToast";
import { Card } from "@/components/ui/card";
import { StatusRow } from "@/components/StatusRow";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Loading } from "@/components/Loading";
import { EncodingStatus } from "./-components/EncodingStatus";
import type { SeekCommand } from "@/types/recording";
import { formatDuration } from "@/lib/utils";

import one_icon from "@/assets/icons/1_icon.svg";
import two_icon from "@/assets/icons/2_icon.svg";
import three_icon from "@/assets/icons/3_icon.svg";

export const Route = createFileRoute("/_auth/video/$date/")({
  loader: ({ context: { queryClient }, params: { date } }) => {
    return queryClient.ensureQueryData(queries.videos.detail(date));
  },
  pendingComponent: () => <Loading />,
  component: RouteComponent,
});

function RouteComponent() {
  const { date } = Route.useParams();
  const navigate = useNavigate();
  const { deauthorize } = useTokenStore();
  const { showToast } = useToast();

  const { data } = useSuspenseQuery(queries.videos.detail(date));
  const [seekCommand, setSeekCommand] = useState<SeekCommand | null>(null);

  const { mutate: logout } = useMutation({
    ...mutations.auth.logout,
    onSuccess: () => {
      deauthorize();
      showToast({ type: "success", description: "로그아웃되었습니다." });
      navigate({ to: "/welcome" });
    },
  });

  const handleTimestampClick = (index: number) => {
    setSeekCommand({
      timestampIndex: index,
    });
  };

  const mainQuestion = data.timestamps[0]?.label;
  const title = mainQuestion ? `"${mainQuestion}" 외` : "영상 기록 보기";

  return (
    <div className="bg-background-primary h-full w-full">
      <Header>
        <Button variant="secondary" onClick={() => logout()}>
          로그아웃
        </Button>
      </Header>
      <main className="flex items-start gap-10 p-10">
        <Card
          variant="white"
          padding="lg"
          className="relative flex-1 hover:scale-100"
        >
          <EncodingStatus encoded={data.encoded} />
          <div className="text-center">
            <h2 className="text-secondary text-lg font-semibold">{title}</h2>
            <p className="text-secondary text-sm">{date}</p>
          </div>
          <VideoPlayer
            className="mt-2 w-full rounded-lg shadow-sm"
            videoUrl={data.s3Url}
            timestamps={data.timestamps}
            seekCommand={seekCommand}
          />
        </Card>
        <Card variant="white" padding="lg" className="flex-1 hover:scale-100">
          <h2 className="text-secondary text-lg font-semibold">
            이 날의 이야기
          </h2>
          <div className="mt-3 flex w-full flex-col gap-4">
            {data.timestamps.map((timestamp, index) => (
              <StatusRow
                key={index}
                imgSrc={
                  index === 0 ? one_icon : index === 1 ? two_icon : three_icon
                }
                content={timestamp.label}
                description={formatDuration(timestamp.time)}
                onClick={() => handleTimestampClick(index)}
              />
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
