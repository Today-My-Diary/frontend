import { z } from "zod";

export const RegisterFcmTokenRequest = z.object({
  fcmToken: z.string(),
});
