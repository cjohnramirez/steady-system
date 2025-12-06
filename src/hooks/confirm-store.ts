import { create } from "zustand";

type ConfirmState = {
  isOpen: boolean;
  title: string;
  message: string;
  resolve?: (value: boolean) => void;
  confirm: (title: string, message: string) => Promise<boolean>;
  close: () => void;
};

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  resolve: undefined,

  confirm: (title, message) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        resolve,
      });
    });
  },

  close: () => {
    set({ isOpen: false });
  },
}));
