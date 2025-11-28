import { create } from "zustand";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

type ConfirmState = {
  isOpen: boolean;
  options: ConfirmOptions;
  openConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
};

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  options: {},
  openConfirm: (options) => set({ isOpen: true, options }),
  closeConfirm: () => set({ isOpen: false, options: {} }),
}));
