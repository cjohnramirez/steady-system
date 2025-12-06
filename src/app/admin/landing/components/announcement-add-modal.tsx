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
import { insertAnnouncement } from "../actions";
import { announcementInsertFormSchema } from "../schema";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AnnouncementAddModal({
  open,
  setOpen,
}: AnnouncementModalProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: insertAnnouncement,
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
      description: "",
      end_date: "",
      location: "",
      start_date: "",
      title: "",
    },
    validators: {
      onChange: announcementInsertFormSchema,
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
          <DialogTitle>Add Announcement</DialogTitle>
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
            <div className="rounded-2xl border p-2 h-full">
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
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Start Date</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex gap-2">
                          {field.state.value || "Select date"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="flex flex-col items-center">
                        <DropdownMenuLabel>Select Start Date</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Calendar
                          mode="single"
                          selected={
                            field.state.value
                              ? new Date(field.state.value)
                              : undefined
                          }
                          onSelect={(date) =>
                            field.setValue(
                              date?.toISOString().split("T")[0] || "",
                            )
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="end_date">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>End Date</FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {field.state.value || "Select date"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="flex flex-col items-center">
                        <DropdownMenuLabel>Select End Date</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Calendar
                          mode="single"
                          selected={
                            field.state.value
                              ? new Date(field.state.value)
                              : undefined
                          }
                          onSelect={(date) =>
                            field.setValue(
                              date?.toISOString().split("T")[0] || "",
                            )
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
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
