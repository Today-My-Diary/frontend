import { useCallback, useEffect, useRef, useState } from "react";

import { RECORDING_CONFIG } from "@/config/recording";
import { type CameraErrorType } from "@/types/recording";

interface UseCameraReturn {
  stream: MediaStream | null;
  error: CameraErrorType | null;
  isLoading: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<CameraErrorType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: RECORDING_CONFIG.VIDEO_CONSTRAINTS,
        audio: RECORDING_CONFIG.AUDIO_CONSTRAINTS,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
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
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { stream, error, isLoading, startCamera, stopCamera };
}
