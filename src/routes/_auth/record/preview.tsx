import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useRecordContext } from "./-contexts/RecordContext";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { StatusRow } from "@/components/StatusRow";
import { Loading } from "@/components/Loading";
import type { SeekCommand } from "@/types/recording";
import { formatDuration } from "@/lib/utils";

import one_icon from "@/assets/icons/1_icon.svg";
import two_icon from "@/assets/icons/2_icon.svg";
import three_icon from "@/assets/icons/3_icon.svg";

export const Route = createFileRoute("/_auth/record/preview")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { recordedBlob, timestamps } = useRecordContext();
  const [seekCommand, setSeekCommand] = useState<SeekCommand | null>(null);

  const blobURL = useMemo(() => {
    return recordedBlob ? URL.createObjectURL(recordedBlob) : "";
  }, [recordedBlob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(blobURL);
  }, [blobURL]);

  const handleTimestampClick = (index: number) => {
    setSeekCommand({
      timestampIndex: index,
    });
  };

  const handleRetake = () => {
    if (confirm("다시 촬영하시겠습니까? 현재 영상은 삭제됩니다.")) {
      navigate({ to: "/record/studio", mask: { to: "/record" } });
    }
  };

  if (!timestamps.length) {
    return <Navigate to="/record" replace />;
  }

  if (!recordedBlob) {
    return <Loading />;
  }

  return (
    <div className="bg-secondary-light flex min-h-full w-full flex-col items-center gap-10 py-10">
      <h1 className="text-secondary text-3xl font-bold">
        오늘의 기록을 확인해보세요!
      </h1>

      <div>
        <VideoPlayer
          className="w-3xl rounded-t-lg shadow-sm"
          videoUrl={blobURL || ""}
          timestamps={timestamps}
          seekCommand={seekCommand}
        />

        <div className="bg-background-primary flex w-full max-w-3xl flex-col gap-4 rounded-b-lg p-8 shadow-sm">
          {timestamps.map((item, index) => (
            <StatusRow
              key={index}
              imgSrc={
                index === 0 ? one_icon : index === 1 ? two_icon : three_icon
              }
              content={item.label}
              description={formatDuration(item.time)}
              onClick={() => handleTimestampClick(index)}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full justify-center gap-6">
        <Button onClick={handleRetake} variant="secondary">
          다시 촬영하기
        </Button>
        <Button
          onClick={() =>
            navigate({ to: "/record/thumbnail", mask: { to: "/record" } })
          }
        >
          영상 저장하기
        </Button>
      </div>
    </div>
  );
}
