import { create } from "zustand";

export type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Paints the confirm button red, for deletes and other irreversible actions. */
  destructive?: boolean;
  /**
   * The work to do once confirmed. The dialog stays open with a spinner on the
   * confirm button until it settles, then closes. Errors are the action's to
   * report (a toast); the dialog closes either way.
   */
  action?: () => Promise<unknown>;
};

type ConfirmRequest = ConfirmOptions & { resolve: (value: boolean) => void };

type ConfirmState = {
  request: ConfirmRequest | null;
  running: boolean;
  open: (options: ConfirmOptions) => Promise<boolean>;
  settle: (value: boolean) => Promise<void>;
};

/**
 * Backs the single <ConfirmDialog /> mounted in the root layout.
 *
 * The dialog owns the pending state of a confirmed `action`, and closes itself in
 * a `finally` when the action ends. The very first version made each caller call
 * stopLoading() itself, and every caller that forgot (the reschedule modal, and
 * any early return) left a disabled dialog covering the page.
 */
export const useConfirmStore = create<ConfirmState>((set, get) => ({
  request: null,
  running: false,
  open: (options) =>
    new Promise<boolean>((resolve) => {
      if (get().running) {
        resolve(false);
        return;
      }
      get().request?.resolve(false);
      set({ request: { ...options, resolve } });
    }),
  settle: async (value) => {
    const request = get().request;
    if (!request || get().running) return;

    if (!value || !request.action) {
      request.resolve(value);
      set({ request: null });
      return;
    }

    set({ running: true });
    try {
      await request.action();
    } catch (error) {
      console.error(error);
    } finally {
      request.resolve(true);
      set({ request: null, running: false });
    }
  },
}));

/**
 * `const confirm = useConfirm();`
 * `await confirm({ title, description, action: () => doIt() })`
 */
export function useConfirm() {
  return useConfirmStore((state) => state.open);
}
