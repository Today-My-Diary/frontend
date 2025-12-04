import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Part } from "@/types/recording";
import { getKSTDate } from "@/lib/utils";

export interface UploadSession {
  uploadId: string;
  uploadDate: string;
  partCount: number;
  completedParts: Part[];
  lastUpdated: number;
}

interface UploadState {
  sessions: Record<string, UploadSession>;
}

export interface UploadStore extends UploadState {
  saveSession: (fileKey: string, session: UploadSession) => void;
  addCompletedPart: (fileKey: string, part: Part) => void;
  removeSession: (fileKey: string) => void;
  clearExpiredSessions: (expirationMs: number) => void;
}

const initialState: UploadState = {
  sessions: {},
};

export const useUploadStore = create<UploadStore>()(
  persist(
    (set) => ({
      ...initialState,
      saveSession: (fileKey, session) =>
        set((state) => ({
          sessions: { ...state.sessions, [fileKey]: session },
        })),
      addCompletedPart: (fileKey, part) =>
        set((state) => {
          const currentSession = state.sessions[fileKey];
          if (
            !currentSession ||
            currentSession.completedParts.some(
              (p) => p.PartNumber === part.PartNumber,
            )
          ) {
            return state;
          }
          return {
            sessions: {
              ...state.sessions,
              [fileKey]: {
                ...currentSession,
                completedParts: [...currentSession.completedParts, part],
                lastUpdated: getKSTDate().getTime(),
              },
            },
          };
        }),
      removeSession: (fileKey) =>
        set((state) => {
          const newSessions = { ...state.sessions };
          delete newSessions[fileKey];
          return { sessions: newSessions };
        }),
      clearExpiredSessions: (expirationMs) =>
        set((state) => {
          const now = getKSTDate().getTime();
          const newSessions = { ...state.sessions };
          let hasChanges = false;
          Object.keys(newSessions).forEach((key) => {
            if (now - newSessions[key].lastUpdated > expirationMs) {
              delete newSessions[key];
              hasChanges = true;
            }
          });
          return hasChanges ? { sessions: newSessions } : state;
        }),
    }),
    {
      name: "upload-session-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
