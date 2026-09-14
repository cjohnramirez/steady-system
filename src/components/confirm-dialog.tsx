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
      <AlertDialogContent aria-busy={running || undefined}>
        <AlertDialogHeader>
          <AlertDialogTitle>{request?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {request?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={running}
            onClick={() => void settle(false)}
          >
            {request?.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={request?.destructive ? "destructive" : "default"}
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
