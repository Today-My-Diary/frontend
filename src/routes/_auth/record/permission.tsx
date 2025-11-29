import { useEffect } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useRecordContext } from "./-contexts/RecordContext";
import { Card } from "@/components/ui/card";
import { FairyCharacter } from "@/components/FairyCharacter";
import { Button } from "@/components/ui/button";
import { ActionRow } from "@/components/ActionRow";
import { useToast } from "@/hooks/useToast";
import { queries } from "@/api";

import camera_icon from "@/assets/icons/camera_icon.svg";
import mic_icon from "@/assets/icons/mic_icon.svg";
import camera_green_icon from "@/assets/icons/camera_green_icon.svg";
import mic_green_icon from "@/assets/icons/mic_green_icon.svg";

export const Route = createFileRoute("/_auth/record/permission")({
  loader: async ({ context: { queryClient } }) => {
    const todayVideo = await queryClient.ensureQueryData(queries.videos.today);
    if (todayVideo.todayVideoExists) {
      throw redirect({
        to: "/my",
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { startCamera, permissionStatus, isLoading, error } =
    useRecordContext();
  const { showToast } = useToast();

  useEffect(() => {
    if (error) {
      showToast({
        description: "권한이 거부되었습니다. 설정에서 권한을 허용해주세요.",
        type: "error",
      });
    }
  }, [error, showToast]);

  const handleButtonClick = async () => {
    if (!permissionStatus.audio || !permissionStatus.video) {
      await startCamera();
    } else {
      navigate({
        to: "/record/studio",
        mask: { to: "/record" },
      });
    }
  };

  return (
    <div className="bg-secondary-light flex h-full w-full items-center justify-center px-4">
      <Card
        variant="primary"
        padding="lg"
        className="flex w-full max-w-sm flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center">
          <FairyCharacter size={100} />
          <p className="text-secondary text-lg font-semibold">
            오늘의 이야기를 들려주세요.
          </p>
          <p className="text-secondary text-sm font-light">
            {permissionStatus.audio && permissionStatus.video
              ? "Tip: 오른쪽 방향키로 다음 질문을 받을 수 있어요."
              : "카메라와 마이크 권한이 필요합니다."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <ActionRow
            variant={permissionStatus.video ? "success" : "default"}
            icon={
              <img
                src={permissionStatus.video ? camera_green_icon : camera_icon}
                alt="camera"
                className="size-8"
              />
            }
            title="카메라"
            description={`권한 ${permissionStatus.video ? "허용됨" : "필요"}`}
          />
          <ActionRow
            variant={permissionStatus.audio ? "success" : "default"}
            icon={
              <img
                src={permissionStatus.audio ? mic_green_icon : mic_icon}
                alt="mic"
                className="size-8"
              />
            }
            title="마이크"
            description={`권한 ${permissionStatus.audio ? "허용됨" : "필요"}`}
          />
        </div>

        <div className="w-full">
          <Button
            size="sm"
            className="w-full"
            onClick={handleButtonClick}
            disabled={isLoading}
          >
            {isLoading
              ? "장치 연결 중..."
              : permissionStatus.audio && permissionStatus.video
                ? "녹화 시작하기"
                : "권한 허용하기"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="my-2 w-full"
            onClick={() => navigate({ to: "/my" })}
          >
            ← 돌아가기
          </Button>
        </div>
      </Card>
    </div>
  );
}
