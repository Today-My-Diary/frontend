import { Navigate, Outlet, createFileRoute } from "@tanstack/react-router";
import { useCamera } from "@/hooks/useCamera";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import {
  RecordContext,
  type RecordContextType,
} from "./record/-contexts/RecordContext";
import type { Timestamp } from "@/types/recording";
import { useCallback, useState } from "react";
import { useSnapshot } from "@/hooks/useSnapshot";

export const Route = createFileRoute("/_auth/record")({
  component: RouteComponent,
  notFoundComponent: () => <Navigate to="/record" replace />,
});

function RouteComponent() {
  const {
    stream,
    permissionStatus,
    isLoading,
    error,
    startCamera,
    stopCamera,
  } = useCamera();
  const {
    isRecording,
    recordedBlob,
    recordingStartTime,
    startRecording,
    stopRecording,
    resetRecording: resetInternalRecording,
  } = useMediaRecorder(stream);
  const { captureSnapshot } = useSnapshot();

  const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
  const [thumbnail, setThumbnail] = useState<Blob | null>(null);

  const resetRecording = useCallback(() => {
    resetInternalRecording();
    setTimestamps([]);
  }, [resetInternalRecording]);

  const captureThumbnail = useCallback(
    async (videoRef: React.RefObject<HTMLVideoElement | null>) => {
      const snapshotBlob = await captureSnapshot(videoRef.current);
      setThumbnail(snapshotBlob);
    },
    [captureSnapshot],
  );

  const recordContextValue: RecordContextType = {
    stream,
    permissionStatus,
    isLoading,
    error,
    isRecording,
    recordedBlob,
    recordingStartTime,
    timestamps,
    thumbnail,
    setTimestamps,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    resetRecording,
    captureThumbnail,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <RecordContext.Provider value={recordContextValue}>
          <Outlet />
        </RecordContext.Provider>
      </div>
    </div>
  );
}
