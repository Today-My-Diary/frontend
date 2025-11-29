import { useUpload } from "@/hooks/useUpload";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useRecordContext } from "./-contexts/RecordContext";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FairyCharacter } from "@/components/FairyCharacter";
import { ProgressBar } from "./-components/ProgressBar";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_auth/record/upload")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { uploadAsync, progress, isSuccess, isError, error } = useUpload();
  const { thumbnail, recordedBlob, timestamps } = useRecordContext();

  // Upload 시작
  useEffect(() => {
    uploadAsync({
      video: recordedBlob!,
      thumbnail: thumbnail!,
      timestamps,
    });
  }, [recordedBlob, thumbnail, timestamps, uploadAsync]);

  // 성공 트리거
  useEffect(() => {
    if (isSuccess) {
      showToast({
        description: "오늘의 일기 업로드가 완료되었습니다!",
        type: "success",
      });
      navigate({ to: "/my", replace: true });
    }
  }, [isSuccess, navigate, showToast]);

  // 에러 트리거
  useEffect(() => {
    if (isError) {
      showToast({
        description:
          error?.message || "업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
        type: "error",
      });
    }
  }, [isError, error, showToast]);

  const handleRetry = () => {
    uploadAsync({
      video: recordedBlob!,
      thumbnail: thumbnail!,
      timestamps,
    });
  };

  if (!recordedBlob || !thumbnail || timestamps.length === 0) {
    return <Navigate to="/record" replace />;
  }

  return (
    <div className="bg-secondary-light text-secondary flex h-full w-full flex-col items-center justify-center px-2">
      <Card variant="primary" className="w-full max-w-xs gap-0">
        <FairyCharacter size={80} />
        <p className="text-lg font-semibold">
          {isError
            ? "업로드 중 오류가 발생했습니다."
            : "오늘의 기록을 저장하고 있어요."}
        </p>
        <p className="mb-5 text-sm">
          {isError ? "잠시 후 다시 시도해주세요." : "잠시만 기다려주세요."}
        </p>
        {isError ? (
          <Button onClick={handleRetry}>다시 시도하기</Button>
        ) : (
          <ProgressBar progress={progress} />
        )}
      </Card>
    </div>
  );
}
