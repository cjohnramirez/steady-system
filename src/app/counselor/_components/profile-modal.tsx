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
import { Edit2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { FormInputField } from "@/components/form-input-field";
import { fetchCounselorProfile, updateCounselorProfile } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { counselorUpdateFormSchema } from "../schema";
import { useUserStore } from "@/hooks/auth-store";

interface CounselorModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userID: string;
}

export default function CounselorProfileModal({
  open,
  setOpen,
  userID,
}: CounselorModalProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: counselor } = useQuery({
    queryKey: ["counselor-profile"],
    queryFn: () => fetchCounselorProfile(supabase, userID),
  });

  const updateMutation = useMutation({
    mutationFn: updateCounselorProfile,
    onSuccess: async () => {
      toast.success("Counselor profile updated successfully!");
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["counselor-profile"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update counselor profile");
    },
  });

  const form = useForm({
    defaultValues: {
      first_name: counselor?.first_name || "",
      last_name: counselor?.last_name || "",
      username: counselor?.username || "",
      university_id: String(counselor?.university_id) || "",
      email: counselor?.email || "",
      phone: counselor?.phone ? String(counselor.phone) : "",
      id: userID,
    },
    validators: {
      onChange: counselorUpdateFormSchema,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
      useUserStore.setState({ userName: value.username });
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
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[170px_auto_auto] grid-rows-[auto_auto_auto] gap-2 pt-5"
          id="update-student-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
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
          <div className="col-span-2 flex h-full w-full gap-2">
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
          <div className="h-full w-full">
            <form.Field name="university_id">
              {(field) => (
                <FormInputField
                  label="University ID"
                  placeholder="Enter a valid university ID (student)"
                  field={field}
                />
              )}
            </form.Field>
          </div>
          <div className="h-full w-full">
            <form.Field name="email">
              {(field) => (
                <FormInputField
                  label="Email"
                  placeholder="Enter a valid email"
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
