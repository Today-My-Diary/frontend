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

export function tryJson<T extends json>(
  input: string,
  schema: z.ZodType<T>,
):
  | T
  | typeof INVALID_JSON
  | typeof INVALID_DATA
  | z.infer<typeof BaseErrorResponse> {
  const result = _tryJson(input, z.union([schema, BaseErrorResponse]));
  return result;
}

function _tryJson<T extends json>(
  input: string,
  schema?: z.ZodType<T>,
  debug = false,
): T | typeof INVALID_JSON | typeof INVALID_DATA {
  try {
    const safeInput = input?.trim() ? input : "{}";
    const result = JSON.parse(safeInput);
    if (!schema) return result;

    const schemaResult = schema.safeParse(result);
    if (schemaResult.success) return schemaResult.data;
    if (debug || env.DEV) {
      console.error(input);
      console.error(schemaResult.error);
    }
    return INVALID_DATA;
  } catch (e) {
    if (debug || env.DEV) {
      console.error(input);
      console.error(e);
    }
    return INVALID_JSON;
  }
}

export function noToastError<T extends json>(
  res: KyResponse<unknown>,
  result:
    | T
    | typeof INVALID_DATA
    | typeof INVALID_JSON
    | z.infer<typeof BaseErrorResponse>,
): T {
  if (result === INVALID_DATA || result === INVALID_JSON) {
    throw new HandledToastError(res.url, res.status);
  }

  if (!res.ok) {
    throw new HandledToastError(res.url, res.status);
  }

  return result as T;
}

export function toastError<T extends json>(
  res: KyResponse<unknown>,
  result:
    | T
    | typeof INVALID_DATA
    | typeof INVALID_JSON
    | z.infer<typeof BaseErrorResponse>,
): T {
  if (result === INVALID_DATA || result === INVALID_JSON) {
    _toastError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    throw new HandledToastError(res.url, res.status);
  }

  if (!res.ok) {
    const errorResponse = BaseErrorResponse.safeParse(result);
    if (errorResponse.success) {
      _toastError(
        errorResponse.data.message ??
          errorResponse.data.error ??
          "요청 처리 중 오류가 발생했습니다.",
      );
    } else {
      _toastError("요청 처리 중 오류가 발생했습니다.");
    }
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
