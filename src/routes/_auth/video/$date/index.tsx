import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/components/ui/header";
import { queries } from "@/api";
import { Card } from "@/components/ui/card";
import { ActionRow } from "@/components/ActionRow";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Loading } from "@/components/Loading";
import { EncodingStatus } from "./-components/EncodingStatus";
import type { SeekCommand } from "@/types/recording";
import { formatDuration } from "@/lib/utils";
import { NumberBadge } from "@/components/NumberBadge";
import { LogoutButton } from "@/components/LogoutButton";

export const Route = createFileRoute("/_auth/video/$date/")({
  loader: ({ context: { queryClient }, params: { date } }) => {
    return queryClient.ensureQueryData(queries.videos.detail(date));
  },
  pendingComponent: () => <Loading />,
  component: RouteComponent,
});

function RouteComponent() {
  const { date } = Route.useParams();
  const { data } = useSuspenseQuery(queries.videos.detail(date));
  const [seekCommand, setSeekCommand] = useState<SeekCommand | null>(null);

  const handleTimestampClick = (index: number) => {
    setSeekCommand({
      timestampIndex: index,
    });
  };

  const mainQuestion = data.timestamps[0]?.label;
  const title = mainQuestion ? `"${mainQuestion}" 외` : "영상 기록 보기";

  return (
    <div className="bg-background-primary min-h-screen w-full">
      <Header>
        <LogoutButton />
      </Header>
      <main className="flex flex-col items-start gap-6 p-4 lg:flex-row lg:gap-10 lg:p-10">
        <Card
          variant="white"
          padding="xl"
          className="relative w-full flex-1 hover:scale-100"
        >
          <EncodingStatus encoded={data.encoded} />
          <div className="mt-5 text-center md:mt-0">
            <h2 className="text-secondary text-lg font-semibold break-keep">
              {title}
            </h2>
            <p className="text-secondary text-sm">{date}</p>
          </div>
          <VideoPlayer
            className="mt-2 w-full rounded-lg shadow-sm"
            videoUrl={data.s3Url}
            timestamps={data.timestamps}
            seekCommand={seekCommand}
          />
        </Card>
        <Card
          variant="white"
          padding="xl"
          className="w-full flex-1 hover:scale-100"
        >
          <h2 className="text-secondary text-lg font-semibold">
            이 날의 이야기
          </h2>
          <div className="mt-3 flex w-full flex-col gap-2 md:gap-4">
            {data.timestamps.map((timestamp, index) => (
              <ActionRow
                key={index}
                icon={<NumberBadge number={index + 1} />}
                title={timestamp.label}
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
