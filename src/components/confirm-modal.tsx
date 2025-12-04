"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmStore } from "@/hooks/confirm-store";

export default function ConfirmModal() {
  const { isOpen, title, message, resolve, close } = useConfirmStore();

  const handleCancel = () => {
    resolve?.(false);
    close();
  };

  const handleConfirm = () => {
    resolve?.(true);
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <p className="">{message}</p>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
