import type z from "zod";
import type { TimestampSchema } from "@/api/types/video";
import type { PartSchema } from "@/api/types/upload";

export type CameraErrorType =
  | "permission-denied"
  | "not-found"
  | "not-readable"
  | "unknown";

export interface SeekCommand {
  timestampIndex: number;
}

export interface PermissionStatus {
  video: boolean;
  audio: boolean;
}

export type Timestamp = z.infer<typeof TimestampSchema>;
export type Part = z.infer<typeof PartSchema>;
