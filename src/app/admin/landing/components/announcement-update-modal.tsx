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
import { announcementInsertFormSchema, announcementUpdateFormSchema } from "../schema";
import { Label } from "@/components/ui/label";
import { FormDateTimeField } from "@/components/form-date-time-field";

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

  const { data: annoucement } = useQuery({
    queryKey: ["annoucement", id],
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
      toast.error(err.message || "Failed to update annoucements");
    },
  });

  const form = useForm({
    defaultValues: {
      description: annoucement?.description ?? "",
      end_date: annoucement?.end_date ?? "",
      location: annoucement?.location ?? "",
      start_date: annoucement?.start_date ?? "",
      title: annoucement?.title ?? "",
      id: annoucement?.id,
    },
    validators: {
      onChange: announcementUpdateFormSchema,
    },
    onSubmitInvalid: ({formApi}) => {
      console.log(formApi.state.values)
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Update Announcement</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[250px_auto_auto] grid-rows-[auto_auto_auto] gap-4 pt-5"
          id="update-student-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row-span-3 flex flex-col gap-4">
            <Label>Annoucement Image</Label>
            <div className="h-full rounded-2xl border p-2">
              <label
                htmlFor="fileUpload"
                className="row-span-3 flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-400 p-4 text-center"
              >
                <Upload strokeWidth={1.25} />
                <p>Click to upload the image.</p>
              </label>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept="image/*"
              />
            </div>
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
                  placeholder="Enter title of annoucement"
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
            disabled={updateMutation.isPending}
            form="update-student-profile-form"
          >
            {updateMutation.isPending ? <Spinner /> : "Update"}
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
