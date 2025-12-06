import { useRef } from "react";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useRecordContext } from "./-contexts/RecordContext";
import { CameraPreview } from "./-components/CameraPreview";
import { Button } from "@/components/ui/button";
import { FairyCharacter } from "@/components/FairyCharacter";

export const Route = createFileRoute("/_auth/record/thumbnail")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { stream, timestamps, captureThumbnail } = useRecordContext();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleCapture = async () => {
    await captureThumbnail(videoRef);
    navigate({ to: "/record/upload", mask: { to: "/record" } });
  };

  if (!timestamps.length) {
    return <Navigate to="/record" replace />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <CameraPreview stream={stream} ref={videoRef} />
      <div className="absolute top-10 right-0 left-0 flex w-full justify-center">
        <div className="flex flex-col items-center rounded-lg bg-black/60 p-8 text-center text-white shadow-lg backdrop-blur-sm">
          <FairyCharacter size={80} />
          <p className="text-lg">썸네일 이미지를 촬영해주세요.</p>
          <p className="mt-1 text-sm font-extralight">
            이 사진이 앨범에 기록됩니다.
          </p>
        </div>
      </div>

      <div className="absolute right-0 bottom-14 left-0 flex w-full justify-center">
        <Button onClick={handleCapture} className="shadow-md">
          촬영하기
        </Button>
      </div>
    </div>
  );
}
