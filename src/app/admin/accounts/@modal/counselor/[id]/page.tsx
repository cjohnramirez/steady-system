"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { fetchCounselor, updateCounselorProfile } from "../../actions";
import { toast } from "sonner";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { Edit2, Info } from "lucide-react";
import { FormInputField } from "@/components/form-input-field";
import CollegeDropdown from "@/app/auth/signup/components/college-dropdown";
import { Spinner } from "@/components/ui/spinner";
import { counselorUpdateFormSchema } from "../../schema";

export default function CounselorModal() {
  const queryClient = useQueryClient();

  const router = useRouter();
  const { id } = useParams();
  const resolvedId = id as string;

  const { data: counselor } = useQuery({
    queryKey: ["counselor", resolvedId],
    queryFn: () => fetchCounselor(resolvedId),
  });

  const updateMutation = useMutation({
    mutationFn: updateCounselorProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Counselor profile updated successfully!");
      router.back();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update counselor profile");
    },
  });

  const form = useForm({
    defaultValues: {
      email: counselor?.email ?? "",
      first_name: counselor?.first_name ?? "",
      last_name: counselor?.last_name ?? "",
      university_id: counselor?.university_id ?? 0,
      username: counselor?.username ?? "",
      phone: counselor?.phone ?? "",
    },
    validators: {
      onChange: counselorUpdateFormSchema.extend({
        college_id: z.uuid({ message: "College is required" }),
      }),
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate({
        ...value,
        id: counselor?.id ?? "",
        university_id: value.university_id,
      });
    },
  });

  return (
    <Dialog
      open={Boolean(resolvedId)}
      onOpenChange={(isOpen) => {
        if (!isOpen) router.push("/admin/accounts");
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => router.back()}
        aria-describedby="counselor-profile-edit"
      >
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-[170px_auto_auto] grid-rows-[auto_auto_auto] gap-2 pt-3"
          id="update-student-profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="col-span-3 mb-5 flex w-full items-center gap-5 rounded-2xl border bg-white p-5">
            <Info strokeWidth={1.25} />
            <div className="flex-1">
              <p className="font-medium">Counselor Availability</p>
              <p className="text-sm">
                Only the counselor can update their availability. Please contact
                the counselor directly for any changes.
              </p>
            </div>
          </div>
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
          </div>
          <div className="col-span-2 flex h-full w-full gap-2">
            <form.Field name="email">
              {(field) => (
                <FormInputField
                  label="Email"
                  placeholder="Enter valid email"
                  field={field}
                  type="email"
                />
              )}
            </form.Field>
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
            <Button onClick={() => router.back()} variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
