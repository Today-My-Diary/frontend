import { useState, useRef, useEffect, useCallback } from "react";
import fixWebmDuration from "fix-webm-duration";

import { RECORDING_CONFIG } from "@/config/recording";

interface UseMediaRecorderReturn {
  isRecording: boolean;
  recordedBlob: Blob | null;
  duration: number;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

export function useMediaRecorder(
  stream: MediaStream | null
): UseMediaRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
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
    startTimeRef.current = Date.now();

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      if (timerRef.current !== null) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }

      const blob = new Blob(chunksRef.current, {
        type: mimeType || "video/webm",
      });
      const duration = Date.now() - startTimeRef.current;
      const fixedBlob = await fixWebmDuration(blob, duration);
      setRecordedBlob(fixedBlob);
      setIsRecording(false);
    };

    mediaRecorder.start(RECORDING_CONFIG.BLOB_TIME_SLICE);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordedBlob(null);
    setDuration(0);

    const updateTimer = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setDuration(elapsed);

      if (elapsed >= RECORDING_CONFIG.MAX_RECORDING_DURATION) {
        mediaRecorderRef.current?.stop();
        return;
      }

      timerRef.current = requestAnimationFrame(updateTimer);
    };
    timerRef.current = requestAnimationFrame(updateTimer);
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current !== null) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordedBlob,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  };
}

function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/webm",
    "video/mp4",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}
