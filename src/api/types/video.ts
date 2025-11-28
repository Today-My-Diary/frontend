import { z } from "zod";

export const CalendarVideoSchema = z.object({
  videoId: z.string(),
  uploadDate: z.string().transform((str) => new Date(str)),
  thumbnailS3Url: z.url(),
});

export const TimestampSchema = z.object({
  time: z.coerce.number(),
  label: z.string(),
});

export const PastVideoSchema = z.object({
  videoId: z.string(),
  uploadDate: z.string().transform((str) => new Date(str)),
  thumbnailS3Url: z.url(),
  timestamps: z.array(TimestampSchema),
});

export const TodayVideoResponseSchema = z.object({
  todayVideoExists: z.boolean(),
  pastVideos: z.array(PastVideoSchema),
});

export const VideoDetailResponseSchema = z.object({
  s3Url: z.url(),
  timestamps: z.array(TimestampSchema),
  encoded: z.boolean(),
});

export const CalendarResponseSchema = z.array(CalendarVideoSchema);
