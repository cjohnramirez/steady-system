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
import { Edit2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { counselorInsertFormSchema } from "../@modal/schema";
import FormPasswordField from "@/components/form-password-field";
import { useState } from "react";
import insertCounselor from "../server-actions";
import { useConfirmStore } from "@/hooks/confirm-store";

interface AnnouncementModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddCounselorModal({
  open,
  setOpen,
}: AnnouncementModalProps) {
  const { confirm, startLoading, stopLoading } = useConfirmStore();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);

  const updateMutation = useMutation({
    mutationFn: insertCounselor,
    onSuccess: async () => {
      toast.success("Counselor added successfully!");
      setOpen(false);
      stopLoading()
      queryClient.invalidateQueries({ queryKey: ["counselors"] });
    },
    onError: (err: Error) => {
      stopLoading()
      toast.error(err.message || "Failed to add counselor");
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      university_id: 0,
      username: "",
      phone: "",
      password: "",
    },
    validators: {
      onSubmit: counselorInsertFormSchema,
    },
    onSubmit: async ({ value }) => {
      const ok = await confirm(
        "Add this counselor?",
        "Please make sure all details are correct. Afterwards, verify the email for confirmation",
      );

      startLoading()

      if (!ok) return;
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
          <DialogTitle>Add Counselor</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[170px_auto_auto] grid-rows-[auto_auto_auto] gap-4 py-5"
          id="insert-counselor-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="row-span-4 flex flex-col gap-4">
            <div className="row-span-2 h-full w-full">
              <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-linear-to-t">
                <div className="absolute right-0 bottom-0 cursor-pointer rounded-full border border-gray-200 bg-white p-2">
                  <Edit2
                    onClick={() => toast.info("This is an upcoming feature")}
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="first_name">
              {(field) => (
                <FormInputField
                  label="First Name"
                  placeholder="Enter first name"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="last_name">
              {(field) => (
                <FormInputField
                  label="Last Name"
                  placeholder="Enter last name"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="email">
              {(field) => (
                <FormInputField
                  label="Email"
                  placeholder="Enter email"
                  field={field}
                />
              )}
            </form.Field>
            <form.Field name="university_id">
              {(field) => (
                <FormInputField
                  label="University ID"
                  placeholder="Enter university ID"
                  field={field}
                  type="number"
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="phone">
              {(field) => (
                <FormInputField
                  label="Phone"
                  placeholder="Enter phone number"
                  field={field}
                  type="tel"
                />
              )}
            </form.Field>
            <form.Field name="username">
              {(field) => (
                <FormInputField
                  label="Username"
                  placeholder="Enter username"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="col-span-2 flex gap-2">
            <form.Field name="password">
              {(field) => (
                <FormPasswordField
                  field={field}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              )}
            </form.Field>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            form="insert-counselor-profile-form"
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
