"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Upload } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { fetchAnnouncement, updateAnnouncement } from "../actions";
import { announcementUpdateFormSchema } from "../schema";
import { Label } from "@/components/ui/label";
import { FormDateTimeField } from "@/components/form-date-time-field";
import { useState } from "react";
import ImageUpload from "@/components/image-upload";
import { useImageUpload } from "@/hooks/use-image-upload";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function AnnouncementUpdateModal({
  open,
  setOpen,
  id,
}: AnnouncementModalProps) {
  const queryClient = useQueryClient();
  const image = useImageUpload("announcements");

  const { data: announcement, isLoading } = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => fetchAnnouncement(id),
  });

  const updateMutation = useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: async () => {
      toast.success("Announcement updated successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcement", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update announcements");
    },
  });

  const form = useForm({
    defaultValues: {
      description: announcement?.description ?? "",
      end_date: announcement?.end_date ?? "",
      location: announcement?.location ?? "",
      start_date: announcement?.start_date ?? "",
      title: announcement?.title ?? "",
      id: announcement?.id,
      announcement_image: announcement?.announcement_image ?? "",
    },
    validators: {
      onChange: announcementUpdateFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const imageUrl = await image.resolveImageUrl(value.announcement_image);
        updateMutation.mutate({ ...value, announcement_image: imageUrl });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not upload the image.",
        );
      }
    },
  });

  if (isLoading) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          image.reset();
        }
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={(e) => {
          if (image.isBusy) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Update Announcement</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[250px_auto_auto] grid-rows-[auto_auto_auto] gap-4 pt-5"
          id="announcement-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row-span-3">
            <ImageUpload
              initialURL={announcement?.announcement_image ?? ""}
              setFile={image.setFile}
              setIsDeleted={image.setIsRemoved}
            />
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="start_date">
              {(field) => (
                <FormDateTimeField field={field} description="Start Date" />
              )}
            </form.Field>
            <form.Field name="end_date">
              {(field) => (
                <FormDateTimeField field={field} description="End Date" />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="title">
              {(field) => (
                <FormInputField
                  label="Title"
                  placeholder="Enter title of announcement"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="location">
              {(field) => (
                <FormInputField
                  label="Location"
                  placeholder="Enter location"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2">
            <form.Field name="description">
              {(field) => (
                <FormInputField
                  label="Description"
                  placeholder="Enter description"
                  field={field}
                />
              )}
            </form.Field>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            disabled={updateMutation.isPending || image.isBusy}
            form="update-announcement-form"
          >
            {updateMutation.isPending || (image.isBusy && <Spinner />)}
            <p>Update</p>
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
              disabled={image.isBusy}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
