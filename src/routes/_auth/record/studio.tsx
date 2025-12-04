import { queries } from "@/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useRecordContext } from "./-contexts/RecordContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { CameraPreview } from "./-components/CameraPreview";
import { RecordingTimer } from "./-components/RecordingTimer";
import { QuestionOverlay } from "./-components/QuestionOverlay";
import { CanvasOverlay } from "./-components/CanvasOverlay";
import type { Timestamp } from "@/types/recording";
import { useToast } from "@/hooks/useToast";
import { getKSTDate } from "@/lib/utils";

const questionQueryOptions = () => {
  const day = getKSTDate().getDate().toString().padStart(2, "0");
  return {
    ...queries.questions.daily(day),
    staleTime: 1000 * 60 * 60 * 24,
  };
};

export const Route = createFileRoute("/_auth/record/studio")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(questionQueryOptions());
  },
  pendingComponent: () => <div className="h-full w-full bg-black" />,
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data } = useSuspenseQuery(questionQueryOptions());
  const {
    stream,
    isLoading,
    startRecording,
    stopRecording,
    resetRecording,
    recordingStartTime,
    setTimestamps,
  } = useRecordContext();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const timestampsRef = useRef<Timestamp[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isCanvasMode =
    typeof window !== "undefined" &&
    sessionStorage.getItem("benchmark_render_mode") === "canvas";

  useEffect(() => {
    resetRecording();
  }, [resetRecording]);

  useEffect(() => {
    startRecording();
    timestampsRef.current = [{ time: 0, label: data.questions[0] }];
  }, [startRecording, data.questions]);

  const finishRecording = useCallback(async () => {
    stopRecording();
    setTimestamps(timestampsRef.current);

    navigate({ to: "/record/preview", mask: { to: "/record" } });
  }, [stopRecording, setTimestamps, navigate]);

  const handleTimeout = useCallback(() => {
    showToast({
      description: "제한 시간이 초과되어 녹화가 자동 종료되었습니다.",
      type: "info",
    });
    finishRecording();
  }, [showToast, finishRecording]);

  const handleNext = useCallback(() => {
    if (!recordingStartTime) return;

    if (currentIndex < data.questions.length - 1) {
      const nextIndex = currentIndex + 1;
      const currentTime = getKSTDate().getTime() - recordingStartTime;

      timestampsRef.current.push({
        time: Math.floor(currentTime / 1000),
        label: data.questions[nextIndex],
      });

      setCurrentIndex(nextIndex);
    } else {
      finishRecording();
    }
  }, [recordingStartTime, currentIndex, finishRecording, data.questions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext]);

  if (!isLoading && !stream) {
    return <Navigate to="/record" replace />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <CameraPreview stream={stream} ref={videoRef} />

      {recordingStartTime && (
        <RecordingTimer
          startTime={recordingStartTime}
          onTimeLimitReached={handleTimeout}
        />
      )}

      {isCanvasMode ? (
        <CanvasOverlay
          question={data.questions[currentIndex]}
          index={currentIndex}
          totalCount={data.questions.length}
          onNext={handleNext}
        />
      ) : (
        <QuestionOverlay
          question={data.questions[currentIndex]}
          index={currentIndex}
          totalCount={data.questions.length}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
