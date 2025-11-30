import { ky, kyBase } from "@/lib/ky";
import { noToastError, toastError, tryJson } from "@/lib/request";
import { GetTokenResponseSchema, PostLogoutRequest } from "./types/auth";
import { BaseSuccessResponse } from "./types/base";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { env } from "@/config/env";
import { z } from "zod";

export const authQueries = createQueryKeys("auth", {
  // 이론적으로는 토큰 재발급이지만, 페이지 진입 시 수행하는 동작이므로 쿼리로 구현
  reissue: {
    queryKey: null, // query-key-factory에 키 관리 위임
    queryFn: async () => {
      // kyBase 사용(No Auto Reissue)
      const res = await kyBase.post("auth/reissue", {
        prefixUrl: env.VITE_API_URL,
        credentials: "include",
      });
      const response = tryJson(await res.text(), GetTokenResponseSchema);
      return noToastError(res, response); // 토스트 없이 처리
    },
  },
});

export const authMutations = {
  logout: {
    mutationKey: ["auth", "logout"],
    mutationFn: async (body: z.infer<typeof PostLogoutRequest>) => {
      const res = await ky.post("auth/logout", {
        json: body,
      });
      const response = tryJson(await res.text(), BaseSuccessResponse);
      return toastError(res, response);
    },
  },
};
