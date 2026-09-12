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
import { useForm } from "@tanstack/react-form";
import { CircleOff, GraduationCap, Info, Plus } from "lucide-react";
import DepartmentDropdown from "@/app/auth/signup/components/department-dropdown";
import CollegeDropdown from "@/app/auth/signup/components/college-dropdown";
import { departmentsSchema } from "../schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignDepartment } from "../actions";
import { toast } from "sonner";
import { fetchCounselorDeparments } from "@/app/counselor/actions";
import { createClient } from "@/utils/supabase/client";

interface AssignDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  counselorId: string;
}

export default function AssignDepartmentModal({
  open,
  setOpen,
  counselorId,
}: AssignDepartmentModalProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: departments } = useQuery({
    queryKey: ["counselor-departments", counselorId],
    queryFn: () => fetchCounselorDeparments(supabase, counselorId),
  });

  const updateMutation = useMutation({
    mutationFn: async (depts: Array<{ department_id: string }>) =>
      assignDepartment(counselorId, depts),
    onSuccess: () => {
      toast.success("Departments added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["counselor-departments", counselorId],
      });
      form.reset();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Departments failed to add");
    },
  });

  const form = useForm({
    defaultValues: {
      departments: [
        {
          college_id: "",
          id: "",
        },
      ],
    },
    validators: {
      onChange: departmentsSchema,
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(
        value.departments.map((dept) => ({ department_id: dept.id })),
      );
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
        className="max-h-screen overflow-y-scroll sm:max-w-[900px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Assign Departments to Counselor</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-2"
          id="assign-departments-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            {departments?.length !== 0 ? (
              departments?.map((department, idx) => (
                <div key={idx} className="space-y-2 rounded-2xl border p-4">
                  <GraduationCap strokeWidth={1.25} />
                  <p>{department.title}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex w-full items-center justify-center gap-4 rounded-2xl border p-4">
                <CircleOff strokeWidth={1.25} />
                <p>No departments assigned</p>
              </div>
            )}
          </div>
          <form.Field name="departments">
            {(departmentsField) => (
              <>
                {departmentsField.state.value.map((_: any, index: number) => (
                  <div key={index} className="rounded-lg border">
                    <h4 className="p-4 text-center font-medium">
                      Department No. {index + 1}
                    </h4>
                    <hr className="w-full" />
                    <div className="flex gap-4 p-4">
                      <form.Field name={`departments[${index}].college_id`}>
                        {(field) => <CollegeDropdown field={field} />}
                      </form.Field>
                      <form.Field name={`departments[${index}].id`}>
                        {(field) => (
                          <DepartmentDropdown
                            field={field}
                            college={
                              departmentsField.state.value[index].college_id
                            }
                          />
                        )}
                      </form.Field>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    departmentsField.pushValue({
                      id: "",
                      college_id: "",
                    });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Plus />
                  Add Department
                </Button>
              </>
            )}
          </form.Field>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="assign-departments-form"
            onClick={(e) => {
              e.stopPropagation();
            }}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Assigning..." : "Assign Departments"}
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={(e) => {
                setOpen(false);
                e.stopPropagation();
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
