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
import { Tables } from "@/types/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { fetchCounselor, updateCounselorProfile } from "../../actions";
import { toast } from "sonner";
import { counselorFormSchema } from "../../schema";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { Edit2 } from "lucide-react";
import { FormInputField } from "@/components/form-input-field";
import CollegeDropdown from "@/app/auth/signup/components/college-dropdown";
import { Spinner } from "@/components/ui/spinner";

export default function CounselorModal({ id }: { id?: string }) {
  const queryClient = useQueryClient();

  const params = useParams();
  const resolvedId = id ?? params?.id;
  const router = useRouter();

  const { data: counselor } = useQuery({
    queryKey: ["counselor", params.id],
    queryFn: () =>
      resolvedId ? fetchCounselor(resolvedId[0]) : Promise.resolve(undefined),
    initialData: () => {
      const allQueries = queryClient.getQueriesData({
        queryKey: ["counselors"],
      });

      for (const [_key, queryResult] of allQueries) {
        const listData = (queryResult as any)?.data;
        const found = listData?.find((a: any) => a.id === params.id);
        if (found) return found;
      }
      return undefined;
    },
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
      id: String(counselor?.id ?? ""),
      email: counselor?.email ?? "",
      first_name: counselor?.first_name ?? "",
      last_name: counselor?.last_name ?? "",
      university_id: String(counselor?.university_id ?? ""),
      college_id: String(counselor?.college_id ?? ""),
      username: counselor?.username ?? "",
      phone: counselor?.phone ?? "",
    },
    validators: {
      onChange: counselorFormSchema.extend({
        college_id: z.uuid({ message: "College is required" }),
      }),
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate({
        ...value,
        id: counselor?.id ?? "",
        university_id: Number(value.university_id),
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
            <div className="from-brand-light to-brand-normal relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-t">
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
          </div>
          <div className="h-full w-full">
            <form.Field name="college_id">
              {(field) => (
                <CollegeDropdown field={field} enableDescription={false} />
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
