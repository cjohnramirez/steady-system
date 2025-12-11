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
import { playlistInsertFormSchema } from "../schema";
import { Label } from "@/components/ui/label";
import FormEmotionalStatusField from "@/components/form-emotional-status-field";
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "@/app/actions";
import ImageUpload from "@/components/image-upload";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function PlaylistAddModal({
  open,
  setOpen,
}: AnnouncementModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: insertPlaylist,
    onSuccess: async () => {
      toast.success("Playlist added successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add playlist");
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      link: "",
      creator: "",
      emotional_status_id: "",
      image: "",
    },
    validators: {
      onChange: playlistInsertFormSchema,
    },
    onSubmit: async ({ value }) => {
      let finalValues = { ...value };

      if (file) {
        setIsUploading(true);
        try {
          const result = await uploadToCloudinary(file, "playlists");

          if (result && result.optimizedUrl) {
            finalValues.image = result.optimizedUrl;
          }
        } catch (error) {
          toast.error("Failed to upload playlist image");
          setIsUploading(false);
          return;
        }
      }

      setIsUploading(false);
      updateMutation.mutate(finalValues);
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
        onInteractOutside={(e) => {
          if (isUploading) e.preventDefault();
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
          <div className="row-span-3">
            <ImageUpload
              initialURL={form.state.values.image}
              setFile={setFile}
            />
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
            <form.Field name="emotional_status_id">
              {(field) => (
                <FormEmotionalStatusField
                  emotionalStatus={field.state.value}
                  setEmotionalStatus={(value) => field.setValue(value)}
                  enableDescription={false}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
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
