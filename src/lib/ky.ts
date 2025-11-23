import { default as kyBase } from "ky";
import { useTokenStore } from "@/stores/useTokenStore";
import { env } from "@/config/env";
import { GetTokenResponseSchema } from "@/api/types/auth";

export const ky = kyBase.create({
  throwHttpErrors: false,
  credentials: "include",
  prefixUrl: env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useTokenStore.getState().token;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, _, response) => {
        if (response.status === 401) {
          try {
            const res = await kyBase.post("auth/reissue", {
              prefixUrl: env.VITE_API_URL,
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              const parsed = GetTokenResponseSchema.safeParse(data);

              if (parsed.success) {
                const newToken = parsed.data.accessToken;
                useTokenStore.getState().authorize(newToken);
                request.headers.set("Authorization", `Bearer ${newToken}`);
                return ky(request);
              }
            }
          } catch {
            // Ignore
          }

          useTokenStore.getState().deauthorize();
          window.location.href = "/login?noSession=true";
        }
        return response;
      },
    ],
  },
});

export { kyBase };
