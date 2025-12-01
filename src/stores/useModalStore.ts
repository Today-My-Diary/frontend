import { create } from "zustand";

interface ModalOptions {
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

interface ModalState {
  isOpen: boolean;
  options: ModalOptions;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: ModalOptions) => Promise<boolean>;
  close: () => void;
}

const initialState = {
  isOpen: false,
  options: {
    title: "",
    description: "",
  },
  resolve: null,
};

export const useModalStore = create<ModalState>((set) => ({
  ...initialState,
  confirm: (options) =>
    new Promise((resolve) => {
      set({
        isOpen: true,
        options: {
          confirmText: "확인",
          cancelText: "취소",
          ...options,
        },
        resolve,
      });
    }),
  close: () => set({ isOpen: false, resolve: null }),
}));
