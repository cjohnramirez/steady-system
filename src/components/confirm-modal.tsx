"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/hooks/confirm-store";
import { Spinner } from "./ui/spinner";

export default function ConfirmModal() {
  const { isOpen, isLoading, title, message, accept, cancel } = useConfirmStore();

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <p>{message}</p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={cancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button onClick={accept} disabled={isLoading}>
            {isLoading && <Spinner />}Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

