"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useImageUpload } from "@/hooks/use-image-upload";
import { deleteContent } from "@/lib/content/actions";
import type { Result } from "@/lib/result";
import type { UploadTarget } from "@/lib/uploads/actions";

type Table = "announcement" | "article" | "playlist";

/** Upload, save, then clean up the replaced image; and delete with confirmation. */
export function useContentEditor({
  table,
  target,
  noun,
  queryKey,
  id,
  initialImage,
  onClose,
}: {
  table: Table;
  target: UploadTarget;
  noun: string;
  queryKey: readonly unknown[];
  id: string | null;
  initialImage: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const image = useImageUpload(target, initialImage);

  async function submit(save: (imageUrl: string) => Promise<Result<unknown>>) {
    let imageUrl: string;
    try {
      imageUrl = await image.prepare();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The image could not be uploaded.",
      );
      return;
    }

    const result = await save(imageUrl);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    await image.commit(imageUrl);
    await queryClient.invalidateQueries({ queryKey });
    toast.success(id ? `${noun} updated.` : `${noun} published.`);
    onClose();
  }

  async function remove(title: string) {
    if (!id) return;
    const contentId = id;
    await confirm({
      title: `Delete "${title}"?`,
      description: `It will disappear from the portal and home page. This can't be undone.`,
      confirmLabel: "Delete",
      destructive: true,
      action: async () => {
        const result = await deleteContent(table, contentId);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        await image.commit("");
        await queryClient.invalidateQueries({ queryKey });
        toast.success(`${noun} deleted.`);
        onClose();
      },
    });
  }

  return { image, submit, remove };
}
