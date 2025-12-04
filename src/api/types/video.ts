import { z } from "zod";

// 로컬 타임존 변환용 헬퍼 함수
const stringToLocalDate = (str: string) => {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const CalendarVideoSchema = z.object({
  videoId: z.string(),
  uploadDate: z.string().transform(stringToLocalDate),
  thumbnailS3Url: z.url(),
});

export const TimestampSchema = z.object({
  time: z.coerce.number(),
  label: z.string(),
});

export const PastVideoSchema = z.object({
  videoId: z.string(),
  uploadDate: z.string().transform(stringToLocalDate),
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
