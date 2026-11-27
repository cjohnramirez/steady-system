"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useConfirmStore } from "@/hooks/use-confirm";

/**
 * 2-band confirmation dialog matching Figma ApproveDialog (678:19057) & DeclineDialog (678:19078).
 */
export function ConfirmDialog() {
  const request = useConfirmStore((state) => state.request);
  const running = useConfirmStore((state) => state.running);
  const settle = useConfirmStore((state) => state.settle);

  return (
    <AlertDialog
      open={request !== null}
      // While the action runs, Escape and clicking outside do nothing.
      onOpenChange={(open) => !open && !running && void settle(false)}
    >
      <AlertDialogContent
        aria-busy={running || undefined}
        className="gap-0 overflow-hidden rounded-[15px] p-0 sm:max-w-[411px]"
      >
        <AlertDialogHeader className="border-border border-b p-5 text-left">
          <AlertDialogTitle className="text-[15px] font-medium">
            {request?.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80 text-[15px] leading-snug">
            {request?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-muted/60 flex-row items-center justify-end gap-2.5 p-[15px]">
          <AlertDialogCancel
            disabled={running}
            onClick={() => void settle(false)}
            className="mt-0"
          >
            {request?.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={request?.destructive ? "destructive" : "positive"}
            disabled={running}
            className="disabled:opacity-75"
            onClick={(event) => {
              // Radix closes the dialog on click; with an action it must stay
              // open until the work is done.
              if (request?.action) event.preventDefault();
              void settle(true);
            }}
          >
            {running && <Spinner aria-hidden />}
            {request?.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
