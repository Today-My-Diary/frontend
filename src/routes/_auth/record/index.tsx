import { useEffect, useRef, useState } from "react";

import { useCamera } from "@/hooks/useCamera";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { createFileRoute } from "@tanstack/react-router";
import { CameraPreview } from "./-components/CameraPreview";
import { useSnapshot } from "@/hooks/useSnapshot";

export const Route = createFileRoute("/_auth/record/")({
  component: RouteComponent,
});

function RouteComponent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { stream, error, isLoading, startCamera, stopCamera } = useCamera();
  const {
    isRecording,
    recordedBlob,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useMediaRecorder(stream);
  const [isUploading, setIsUploading] = useState(false);
  const { captureSnapshot } = useSnapshot();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // 새로고침 방지 (녹화본이 있고 업로드 안 됐을 때)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (recordedBlob && !isUploading) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [recordedBlob, isUploading]);

  // 테스트 코드입니다. (실제 UI 아님)
  return (
    <>
      <CameraPreview stream={stream} ref={videoRef} />
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading || !!error}
        className="fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <button
        onClick={() => {
          if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "recording.webm";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }}
        disabled={!recordedBlob}
        className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Download
      </button>
    </>
  );
}
