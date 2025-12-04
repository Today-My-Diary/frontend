import { useState } from "react";
import { z } from "zod";
import pLimit from "p-limit";
import { useMutation } from "@tanstack/react-query";
import { mutations } from "@/api";
import { CompleteVideoUploadRequestSchema } from "@/api/types/upload";
import { useUploadStore } from "@/stores/useUploadStore";
import type { Timestamp } from "@/types/recording";
import { env } from "@/config/env";
import { getKSTDate, getKSTDateWithoutTime } from "@/lib/utils";

export type UploadMode = "resumable" | "batch";
type Part = z.infer<typeof CompleteVideoUploadRequestSchema>["parts"][number];

interface UploadData {
  video: Blob;
  thumbnail: Blob;
  timestamps: Timestamp[];
  mode?: UploadMode;
}

const {
  initiateMultipart,
  getPartPresignedUrl,
  completeMultipart,
  initiateThumbnail,
  completeThumbnail,
} = mutations.upload;

const SESSION_EXPIRATION_MS = 24 * 60 * 60 * 1000;

const uploadPartToS3 = async (
  blob: Blob,
  {
    uploadId,
    uploadDate,
    partNumber,
  }: { uploadId: string; uploadDate: string; partNumber: number },
): Promise<Part> => {
  const { presignedUrl } = await getPartPresignedUrl.mutationFn({
    uploadDate,
    uploadId,
    partNumber,
  });

  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: blob,
  });
  if (!response.ok) throw new Error(`S3 Upload Failed: ${response.status}`);

  const eTag = response.headers.get("ETag");
  if (!eTag) throw new Error("No ETag received");

  return { PartNumber: partNumber, ETag: eTag.replace(/"/g, "") };
};

const getFileKey = (blob: Blob) => {
  const date = getKSTDateWithoutTime();
  return `${date}_${blob.size}`;
};

const processThumbnail = async (thumbnail: Blob, uploadDate: string) => {
  const { presignedUrl } = await initiateThumbnail.mutationFn({ uploadDate });
  await fetch(presignedUrl, { method: "PUT", body: thumbnail });
  await completeThumbnail.mutationFn({ uploadDate });
};

async function uploadBatchStrategy(
  { video, thumbnail, timestamps }: UploadData,
  setProgress: (p: number) => void,
) {
  const uploadDate = getKSTDateWithoutTime();
  const { uploadId } = await initiateMultipart.mutationFn({ uploadDate });

  const part = await uploadPartToS3(video, {
    uploadId,
    uploadDate,
    partNumber: 1,
  });

  setProgress(90);
  await processThumbnail(thumbnail, uploadDate);
  setProgress(95);

  await completeMultipart.mutationFn({
    uploadDate,
    uploadId,
    parts: [part],
    timestamps,
  });
  setProgress(100);
}

async function uploadResumableStrategy(
  { video, thumbnail, timestamps }: UploadData,
  setProgress: (p: number) => void,
) {
  const limit = pLimit(5);
  const fileKey = getFileKey(video);
  const partSize = env.VITE_MULTIPART_SIZE;
  const {
    clearExpiredSessions,
    saveSession,
    sessions,
    addCompletedPart,
    removeSession,
  } = useUploadStore.getState();

  clearExpiredSessions(SESSION_EXPIRATION_MS);

  let state = sessions[fileKey];
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
  const updateProgress = (completed: number) =>
    setProgress(Math.round((completed / partCount) * 90));

  updateProgress(state.completedParts.length);

  const pendingParts = Array.from(
    { length: partCount },
    (_, i) => i + 1,
  ).filter((p) => !state!.completedParts.some((cp) => cp.PartNumber === p));

  await Promise.all(
    pendingParts.map((partNumber) =>
      limit(async () => {
        const start = (partNumber - 1) * partSize;
        const chunk = video.slice(
          start,
          Math.min(partNumber * partSize, video.size),
        );

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const part = await uploadPartToS3(chunk, {
              uploadId,
              uploadDate,
              partNumber,
            });
            addCompletedPart(fileKey, part);
            updateProgress(
              useUploadStore.getState().sessions[fileKey]!.completedParts
                .length,
            );
            return;
          } catch (e) {
            if (attempt === 3) throw e;
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }
        }
      }),
    ),
  );

  await processThumbnail(thumbnail, uploadDate);
  setProgress(95);

  const finalParts = useUploadStore
    .getState()
    .sessions[
      fileKey
    ]!.completedParts.sort((a, b) => a.PartNumber - b.PartNumber);
  await completeMultipart.mutationFn({
    uploadDate,
    uploadId,
    parts: finalParts,
    timestamps,
  });

  removeSession(fileKey);
  setProgress(100);
}

export function useUpload() {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (data: UploadData) => {
      const strategy =
        data.mode === "batch" ? uploadBatchStrategy : uploadResumableStrategy;
      return strategy(data, setProgress);
    },
  });

  return {
    uploadAsync: mutation.mutate,
    progress,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
