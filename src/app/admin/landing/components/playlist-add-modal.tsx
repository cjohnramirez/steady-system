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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Upload } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { insertPlaylist } from "../actions";
import {
  playlistInsertFormSchema,
} from "../schema";
import { Label } from "@/components/ui/label";
import FormEmotionalStatusField from "@/components/form-emotional-status-field";
import { useState } from "react";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function PlaylistAddModal({
  open,
  setOpen,
}: AnnouncementModalProps) {
  const queryClient = useQueryClient();

  const [emotionalStatus, setEmotionalStatus] = useState("");

  const updateMutation = useMutation({
    mutationFn: insertPlaylist,
    onSuccess: async () => {
      toast.success("Announcement added successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add annoucements");
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      link: "",
      creator: "",
      emotional_status_id: emotionalStatus,
    },
    validators: {
      onChange: playlistInsertFormSchema,
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
          <DialogTitle>Add Playlist</DialogTitle>
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
            <Label>Playlist Image</Label>
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
            <form.Field name="link">
              {(field) => (
                <FormInputField
                  label="Link"
                  placeholder="Enter link"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="creator">
              {(field) => (
                <FormInputField
                  label="Creator"
                  placeholder="Enter creator name"
                  field={field}
                />
              )}
            </form.Field>
            <FormEmotionalStatusField
              emotionalStatus={emotionalStatus}
              setEmotionalStatus={setEmotionalStatus}
              enableDescription={false}
            />
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            form="update-student-profile-form"
          >
            {updateMutation.isPending ? <Spinner /> : "Add"}
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
