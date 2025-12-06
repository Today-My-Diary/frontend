import { useCallback, useEffect, useRef, useState } from "react";

import { RECORDING_CONFIG } from "@/config/recording";
import type { CameraErrorType, PermissionStatus } from "@/types/recording";

interface UseCameraReturn {
  stream: MediaStream | null;
  error: CameraErrorType | null;
  isLoading: boolean;
  permissionStatus: PermissionStatus;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<CameraErrorType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    video: false,
    audio: false,
  });
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    // 중복 생성 방어 로직
    if (isLoading) return;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: RECORDING_CONFIG.VIDEO_CONSTRAINTS,
        audio: RECORDING_CONFIG.AUDIO_CONSTRAINTS,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionStatus({
        video: mediaStream.getVideoTracks().length > 0,
        audio: mediaStream.getAudioTracks().length > 0,
      });
    } catch (err) {
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            setError("permission-denied");
            break;
          case "NotFoundError":
            setError("not-found");
            break;
          case "NotReadableError":
            setError("not-readable");
            break;
          default:
            setError("unknown");
        }
      } else {
        setError("unknown");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
      setStream(null);
      setPermissionStatus({ video: false, audio: false });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    stream,
    error,
    isLoading,
    permissionStatus,
    startCamera,
    stopCamera,
  };
}
