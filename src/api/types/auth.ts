import { z } from "zod";

export const GetTokenResponseSchema = z.object({
  accessToken: z.string(),
});

export const PostLogoutRequest = z.object({
  fcmToken: z.string().optional(),
});
