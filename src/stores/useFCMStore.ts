import { create } from "zustand";

interface FCMState {
  fcmToken: string | null;
}

interface FCMStore extends FCMState {
  setFcmToken: (token: string | null) => void;
}

const initialState: FCMState = {
  fcmToken: null,
};

export const useFCMStore = create<FCMStore>((set) => ({
  ...initialState,
  setFcmToken: (token) => set({ fcmToken: token }),
}));
