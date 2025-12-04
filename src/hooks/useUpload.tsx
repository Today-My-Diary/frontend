import { useState } from "react";
import { z } from "zod";
import pLimit from "p-limit";
import { mutations } from "@/api";
import { CompleteVideoUploadRequestSchema } from "@/api/types/upload";
import { useUploadStore } from "@/stores/useUploadStore";
import type { Timestamp } from "@/types/recording";
import { useMutation } from "@tanstack/react-query";
import { env } from "@/config/env";
import { getKSTDate, getKSTDateWithoutTime } from "@/lib/utils";

type Part = z.infer<typeof CompleteVideoUploadRequestSchema>["parts"][number];
const SESSION_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24시간 뒤 파츠 정보 만료
const PROGRESS_AFTER_UPLOAD = 90;
const PROGRESS_AFTER_THUMBNAIL = 95;
const limit = pLimit(5); // 동시 업로드 개수 제한

interface UploadData {
  video: Blob;
  thumbnail: Blob;
  timestamps: Timestamp[];
}

const {
  initiateMultipart,
  getPartPresignedUrl,
  completeMultipart,
  initiateThumbnail,
  completeThumbnail,
} = mutations.upload;

const getFileKey = (blob: Blob) => {
  const date = getKSTDateWithoutTime();
  return `${date}_${blob.size}`;
};

export function useUpload() {
  const [progress, setProgress] = useState<number>(0);

  const uploadMutation = useMutation({
    mutationFn: async ({ video, thumbnail, timestamps }: UploadData) => {
      const fileKey = getFileKey(video);
      const partSize = env.VITE_MULTIPART_SIZE;

      const { clearExpiredSessions, saveSession } = useUploadStore.getState();

      clearExpiredSessions(SESSION_EXPIRATION_MS);

      let state = useUploadStore.getState().sessions[fileKey];

      if (!state) {
        const uploadDate = getKSTDateWithoutTime();
        const { uploadId } = await initiateMultipart.mutationFn({ uploadDate });

        state = {
          uploadId,
          uploadDate,
          partCount: Math.ceil(video.size / partSize),
          completedParts: [],
          lastUpdated: getKSTDate().getTime(),
        };
        saveSession(fileKey, state);
      }

      const { uploadId, uploadDate, partCount } = state;
      let completedCount = state.completedParts.length;

      setProgress(
        Math.round(
          (state.completedParts.length / partCount) * PROGRESS_AFTER_UPLOAD,
        ),
      );

      const partsToUpload = [];
      for (let i = 1; i <= partCount; i++) {
        if (!state.completedParts.some((p) => p.PartNumber === i)) {
          partsToUpload.push(i);
        }
      }

      const uploadPart = async (partNumber: number): Promise<Part> => {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(partNumber * partSize, video.size);
        const blobPart = video.slice(start, end);

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { presignedUrl } = await getPartPresignedUrl.mutationFn({
              uploadDate,
              uploadId,
              partNumber,
            });

            const response = await fetch(presignedUrl, {
              method: "PUT",
              body: blobPart,
            });

            if (!response.ok) throw new Error(`S3 Error: ${response.status}`);
            const eTag = response.headers.get("ETag");
            if (!eTag) throw new Error("No ETag");

            const part = {
              PartNumber: partNumber,
              ETag: eTag.replace(/"/g, ""),
            };

            useUploadStore.getState().addCompletedPart(fileKey, part);

            completedCount++;
            setProgress(
              Math.round((completedCount / partCount) * PROGRESS_AFTER_UPLOAD),
            );

            return part;
          } catch (e) {
            if (attempt === 3) throw e;
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
        throw new Error("Failed logic");
      };

      await Promise.all(
        partsToUpload.map((part) => limit(() => uploadPart(part))),
      );

      const { presignedUrl } = await initiateThumbnail.mutationFn({
        uploadDate,
      });
      const res = await fetch(presignedUrl, {
        method: "PUT",
        body: thumbnail,
      });
      if (!res.ok) throw new Error("Thumbnail upload failed");
      await completeThumbnail.mutationFn({ uploadDate });
      setProgress(PROGRESS_AFTER_THUMBNAIL);

      const finalState = useUploadStore.getState().sessions[fileKey];

      if (!finalState) {
        throw new Error("Upload session lost during process");
      }

      const sortedParts = [...finalState.completedParts].sort(
        (a, b) => a.PartNumber - b.PartNumber,
      );

      await completeMultipart.mutationFn({
        uploadDate,
        uploadId,
        parts: sortedParts,
        timestamps,
      });

      useUploadStore.getState().removeSession(fileKey);
      setProgress(100);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    progress,
    isUploading: uploadMutation.isPending,
    isSuccess: uploadMutation.isSuccess,
    isError: uploadMutation.isError,
    error: uploadMutation.error,
  };
}
