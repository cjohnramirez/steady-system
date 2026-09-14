import { create } from "zustand";

export type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Paints the confirm button red, for deletes and other irreversible actions. */
  destructive?: boolean;
};

type ConfirmState = {
  request: (ConfirmOptions & { resolve: (value: boolean) => void }) | null;
  open: (options: ConfirmOptions) => Promise<boolean>;
  settle: (value: boolean) => void;
};

/**
 * Backs the single <ConfirmDialog /> mounted in the root layout.
 *
 * The dialog closes the moment the user chooses. The old store kept it open with a
 * spinner until the caller remembered to call stopLoading(), and every caller that
 * forgot (the reschedule modal, and any early return) left a disabled dialog
 * covering the page. Show pending state on the button that started the action.
 */
export const useConfirmStore = create<ConfirmState>((set, get) => ({
  request: null,
  open: (options) =>
    new Promise<boolean>((resolve) => {
      get().request?.resolve(false);
      set({ request: { ...options, resolve } });
    }),
  settle: (value) => {
    get().request?.resolve(value);
    set({ request: null });
  },
}));

/** `const confirm = useConfirm(); if (await confirm({ ... })) doIt();` */
export function useConfirm() {
  return useConfirmStore((state) => state.open);
}
