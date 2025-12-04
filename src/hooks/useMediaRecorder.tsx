import { useState, useRef, useEffect, useCallback } from "react";
import fixWebmDuration from "fix-webm-duration";
import { RECORDING_CONFIG } from "@/config/recording";
import { getKSTDate } from "@/lib/utils";

interface UseMediaRecorderReturn {
  isRecording: boolean;
  recordedBlob: Blob | null;
  duration: number;
  recordingStartTime: number | null;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

export function useMediaRecorder(
  stream: MediaStream | null,
): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // 아래 두 상태는 녹화 종료 후에만 업데이트됩니다. (Rerendering Issue)
  const [duration, setDuration] = useState<number>(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(
    null,
  );

  // 얘네가 실질적으로 내부 값을 저장합니다.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(() => {
    if (!stream) return;

    const mimeType = getSupportedMimeType();
    const options = {
      videoBitsPerSecond: RECORDING_CONFIG.VIDEO_BITRATE,
      ...(mimeType && { mimeType }),
    };

    const mediaRecorder = new MediaRecorder(stream, options);
    chunksRef.current = [];

    const now = getKSTDate().getTime();
    startTimeRef.current = now;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, {
        type: mimeType || "video/webm",
      });
      let finalBlob = blob;

      const recordedDuration = getKSTDate().getTime() - startTimeRef.current;
      if (mimeType?.startsWith("video/webm") || !mimeType) {
        finalBlob = await fixWebmDuration(blob, recordedDuration);
      }

      setRecordedBlob(finalBlob);
      setDuration(recordedDuration / 1000);
      setIsRecording(false);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;

    setIsRecording(true);
    setRecordedBlob(null);
    setDuration(0);
    setRecordingStartTime(now);
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
    setRecordingStartTime(null);
  }, []);

  // 컴포넌트 언마운트 시 안전하게 종료
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isRecording,
    recordedBlob,
    duration,
    recordingStartTime,
    startRecording,
    stopRecording,
    resetRecording,
  };
}

function getSupportedMimeType(): string {
  for (const type of RECORDING_CONFIG.VIDEO_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log("Using MediaRecorder MIME type:", type);
      return type;
    }
  }
  return "";
}
