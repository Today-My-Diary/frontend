import { z } from "zod";
import { TimestampSchema } from "@/api/types/video";

export const PartSchema = z.object({
  PartNumber: z.number(),
  ETag: z.string(),
});

// Initiate Multipart Video Upload
export const InitiateVideoUploadRequestSchema = z.object({
  uploadDate: z.string(),
});

export const InitiateVideoUploadResponseSchema = z.object({
  uploadId: z.string(),
});

// Continue Multipart Video Upload
export const ContinueVideoUploadRequestSchema = z.object({
  uploadId: z.string(),
  partNumber: z.number(),
  uploadDate: z.string(),
});

export const ContinueVideoUploadResponseSchema = z.object({
  presignedUrl: z.string(),
});

// Complete Multipart Video Upload
export const CompleteVideoUploadRequestSchema = z.object({
  uploadId: z.string(),
  uploadDate: z.string(),
  parts: z.array(PartSchema),
  timestamps: z.array(TimestampSchema),
});

// Initiate Thumbnail Upload
export const InitiateThumbnailUploadRequestSchema = z.object({
  uploadDate: z.string(),
});

export const InitiateThumbnailUploadResponseSchema = z.object({
  presignedUrl: z.string(),
});

// Complete Thumbnail Upload
export const CompleteThumbnailUploadRequestSchema = z.object({
  uploadDate: z.string(),
});
