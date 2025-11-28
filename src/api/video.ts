import { createQueryKeys } from "@lukemorales/query-key-factory";
import { ky } from "@/lib/ky";
import { tryJson, toastError } from "@/lib/request";
import {
  CalendarResponseSchema,
  TodayVideoResponseSchema,
  VideoDetailResponseSchema,
} from "./types/video";

export const videoQueries = createQueryKeys("videos", {
  calendar: (year: number, month: number) => ({
    queryKey: [year, month],
    queryFn: async () => {
      const res = await ky.get(`videos`, {
        searchParams: { year, month },
      });
      const response = tryJson(await res.text(), CalendarResponseSchema);
      return toastError(res, response);
    },
  }),
  today: {
    queryKey: null,
    queryFn: async () => {
      const res = await ky.get("videos/today");
      const response = tryJson(await res.text(), TodayVideoResponseSchema);
      return toastError(res, response);
    },
  },
  detail: (date: string) => ({
    queryKey: [date],
    queryFn: async () => {
      const res = await ky.get(`videos/${date}`);
      const response = tryJson(await res.text(), VideoDetailResponseSchema);
      return toastError(res, response);
    },
  }),
});
