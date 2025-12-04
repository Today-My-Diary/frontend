import { useUpload, type UploadMode } from "@/hooks/useUpload"; // [Import Type]
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useRecordContext } from "./-contexts/RecordContext";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FairyCharacter } from "@/components/FairyCharacter";
import { ProgressBar } from "./-components/ProgressBar";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/useModalStore";
import { useFCM } from "@/hooks/useFCM";
import { mutations } from "@/api";

export const Route = createFileRoute("/_auth/record/upload")({
  component: RouteComponent,
});

const getBenchmarkMode = (): UploadMode => {
  if (typeof window === "undefined") return "resumable";
  const mode = sessionStorage.getItem("benchmark_upload_mode");
  return mode === "batch" ? "batch" : "resumable";
};

function RouteComponent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { uploadAsync, progress, isSuccess, isError, error } = useUpload();
  const { thumbnail, recordedBlob, timestamps } = useRecordContext();

  const { confirm } = useModalStore();
  const { fcmToken, requestPermission } = useFCM();
  const { mutate: registerToken } = useMutation(mutations.fcm.registerToken);
  const [isModalPending, setIsModalPending] = useState(false);

  // Upload 시작
  useEffect(() => {
    const mode = getBenchmarkMode();

    uploadAsync({
      video: recordedBlob!,
      thumbnail: thumbnail!,
      timestamps,
      mode,
    });
  }, [recordedBlob, thumbnail, timestamps, uploadAsync]);

  // 성공 트리거
  useEffect(() => {
    if (isSuccess && !isModalPending) {
      showToast({
        description: "오늘의 일기 업로드가 완료되었습니다!",
        type: "success",
      });
      navigate({ to: "/my", replace: true });
    }
  }, [isModalPending, isSuccess, navigate, showToast]);

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

  // 알림 모달
  useEffect(() => {
    const checkPermission = async () => {
      if (
        typeof window !== "undefined" &&
        Notification.permission === "default"
      ) {
        setIsModalPending(true);
        const allow = await confirm({
          title: "알림 설정",
          description:
            "영상을 최적으로 시청할 수 있게되면 알림을 보내드릴까요?",
        });
        if (allow) {
          await requestPermission();
        }
        setIsModalPending(false);
      }
    };
    checkPermission();
  }, [confirm, requestPermission]);

  // FCM 토큰 등록
  useEffect(() => {
    if (fcmToken) registerToken({ fcmToken });
  }, [fcmToken, registerToken]);

  // 재시도 핸들러
  const handleRetry = () => {
    const mode = getBenchmarkMode();
    uploadAsync({
      video: recordedBlob!,
      thumbnail: thumbnail!,
      timestamps,
      mode,
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
