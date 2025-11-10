import { useCallback, useRef } from "react";

import { RECORDING_CONFIG } from "@/config/recording";

interface UseSnapshotReturn {
  captureSnapshot: (
    videoElement: HTMLVideoElement | null
  ) => Promise<Blob | null>;
}

export function useSnapshot(): UseSnapshotReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const captureSnapshot = useCallback(
    async (videoElement: HTMLVideoElement | null): Promise<Blob | null> => {
      if (
        !videoElement ||
        !videoElement.videoWidth ||
        !videoElement.videoHeight
      ) {
        console.error("Invalid video element");
        return null;
      }

      try {
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement("canvas");
          canvasRef.current = canvas;
        }

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const ctx = canvas.getContext("2d", {
          alpha: false,
          willReadFrequently: false,
        });

        if (!ctx) {
          console.error("Failed to get canvas context");
          return null;
        }

        // 좌우 반전 (미리보기와 동일하게)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
          videoElement,
          -canvas.width,
          0,
          canvas.width,
          canvas.height
        );
        ctx.restore();

        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create blob"));
              }
            },
            RECORDING_CONFIG.SNAPSHOT_TYPE,
            RECORDING_CONFIG.SNAPSHOT_QUALITY
          );
        });
      } catch (err) {
        console.error("Error capturing snapshot:", err);
        return null;
      }
    },
    []
  );

  return { captureSnapshot };
}
