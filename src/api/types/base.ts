import { z } from "zod";

export const BaseSuccessResponse = z.object({
  message: z.string().optional(),
});

export const BaseErrorResponse = z.object({
  success: z.boolean(),
  errorCode: z.string(),
  message: z.string(),
});

export class HandledToastError extends Error {
  constructor(path: string, status: number) {
    super(`ERROR[${status}] ${path}`);
  }
}
