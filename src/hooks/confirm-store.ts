import { create } from "zustand";

type ConfirmState = {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  message: string;
  resolve?: (value: boolean) => void;

  confirm: (title: string, message: string) => Promise<boolean>;
  startLoading: () => void;
  stopLoading: () => void;
  accept: () => void;
  cancel: () => void;
};


export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  title: "",
  message: "",
  resolve: undefined,

  confirm: (title, message) =>
    new Promise((resolve) => {
      set({
        isOpen: true,
        isLoading: false,
        title,
        message,
        resolve,
      });
    }),

  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false, isOpen: false }),

  accept: () => {
    const { resolve } = get();
    resolve?.(true);
    set({ isLoading: true }); // ✅ keep modal open
  },

  cancel: () => {
    get().resolve?.(false);
    set({ isOpen: false });
  },
}));
