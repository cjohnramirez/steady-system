"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/hooks/confirm-store";

export default function ConfirmModal() {
  const { isOpen, options, closeConfirm } = useConfirmStore();

  const handleConfirm = () => {
    options.onConfirm?.();
    closeConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeConfirm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title || "Are you sure?"}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {options.message || "This action cannot be undone."}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={closeConfirm}>
            {options.cancelText || "Cancel"}
          </Button>
          <Button onClick={handleConfirm}>
            {options.confirmText || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
