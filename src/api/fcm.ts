import { ky } from "@/lib/ky";
import { z } from "zod";
import { toastError, tryJson } from "@/lib/request";
import { BaseSuccessResponse } from "./types/base";
import { RegisterFcmTokenRequest } from "./types/fcm";

export const fcmMutations = {
  registerToken: {
    mutationKey: ["fcm", "registerToken"],
    mutationFn: async (body: z.infer<typeof RegisterFcmTokenRequest>) => {
      const res = await ky.post("fcm/token", {
        json: body,
      });
      const response = tryJson(await res.text(), BaseSuccessResponse);
      return toastError(res, response);
    },
  },
};
