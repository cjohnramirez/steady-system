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
import { fetchPlaylist, updatePlaylist } from "../actions";
import { playlistUpdateFormSchema } from "../schema";
import { Label } from "@/components/ui/label";
import FormEmotionalStatusField from "@/components/form-emotional-status-field";
import { useEffect, useState } from "react";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function PlaylistUpdateModal({
  open,
  setOpen,
  id,
}: AnnouncementModalProps) {
  const queryClient = useQueryClient();

  const { data: playlist, isLoading } = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => fetchPlaylist(id),
  });

  const updateMutation = useMutation({
    mutationFn: updatePlaylist,
    onSuccess: async () => {
      toast.success("Playlist added successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["playlist", id] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add playlist");
    },
  });

  const form = useForm({
    defaultValues: {
      title: playlist?.title ?? "",
      link: playlist?.link ?? "",
      creator: playlist?.creator ?? "",
      emotional_status_id: playlist?.emotional_status_id ?? "",
      id: id ?? "",
    },
    validators: {
      onChange: playlistUpdateFormSchema,
    },
    onSubmitInvalid: ({ formApi }) => {
      console.log(formApi.state.errors);
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  if (isLoading) return;

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
          <DialogTitle>Update Playlist</DialogTitle>
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
