import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { authQueries, authMutations } from "./auth";
import { uploadMutations } from "./upload";
import { questionQueries } from "./question";
import { videoQueries } from "./video";
import { fcmMutations } from "./fcm";

// GET 등 Query 관련 (키 자동 생성)
export const queries = mergeQueryKeys(
  authQueries,
  questionQueries,
  videoQueries,
);

// POST 등 Mutation 관련 (키 수동 생성)
export const mutations = {
  auth: authMutations,
  upload: uploadMutations,
  fcm: fcmMutations,
};
