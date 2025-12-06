import type { KyResponse } from "ky";
import { toast } from "sonner";
import { z } from "zod";
import { env } from "@/config/env";

import { BaseErrorResponse, HandledToastError } from "@/api/types/base";

export const INVALID_JSON = Symbol("INVALID_JSON");
export const INVALID_DATA = Symbol("INVALID_DATA");

type json =
  | Record<string, unknown>
  | Record<string, unknown>[]
  | string
  | number
  | boolean
  | null;

type ErrorResponse = z.infer<typeof BaseErrorResponse>;
function isErrorResponse(data: unknown): data is ErrorResponse {
  return BaseErrorResponse.safeParse(data).success;
}

export function tryJson<T extends json>(
  input: string,
  schema: z.ZodType<T>,
): T | typeof INVALID_JSON | typeof INVALID_DATA | ErrorResponse {
  try {
    const safeInput = input?.trim() ? input : "{}";
    const result = JSON.parse(safeInput);

    const schemaResult = schema.safeParse(result);
    if (schemaResult.success) return schemaResult.data;

    const errorResult = BaseErrorResponse.safeParse(result);
    if (errorResult.success) return errorResult.data;

    if (env.DEV) {
      console.error("[tryJson] Schema Mismatch:", schemaResult.error);
    }
    return INVALID_DATA;
  } catch (e) {
    if (env.DEV) console.error("[tryJson] Parse Error:", e);
    return INVALID_JSON;
  }
}

export function noToastError<T extends json>(
  res: KyResponse<unknown>,
  result: T | typeof INVALID_DATA | typeof INVALID_JSON | ErrorResponse,
): T {
  if (!res.ok || result === INVALID_DATA || result === INVALID_JSON) {
    throw new HandledToastError(res.url, res.status);
  }
  return result as T;
}

export function toastError<T extends json>(
  res: KyResponse<unknown>,
  result: T | typeof INVALID_DATA | typeof INVALID_JSON | ErrorResponse,
): T {
  if (result === INVALID_JSON) {
    _toastError("서버와 통신 중 오류가 발생했습니다.");
    throw new HandledToastError(res.url, res.status);
  }

  if (!res.ok) {
    if (result !== INVALID_DATA && isErrorResponse(result)) {
      _toastError(result.message);
    } else {
      _toastError("알 수 없는 오류가 발생했습니다.");
    }
    throw new HandledToastError(res.url, res.status);
  }

  if (result === INVALID_DATA) {
    _toastError("데이터 형식이 올바르지 않습니다.");
    throw new HandledToastError(res.url, res.status);
  }

  return result as T;
}

function _toastError(message: string) {
  setTimeout(() => {
    toast.error("오류", {
      description: message,
    });
  }, 500);
}
