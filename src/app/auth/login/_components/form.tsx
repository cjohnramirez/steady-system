"use client";

import z from "zod";
import DepartmentDropdown from "./department-dropdown";
import CollegeDropdown from "./college-dropdown";
import { useForm } from "@tanstack/react-form";
import { createClient } from "@/utils/supabase/client";

const formSchema = z.object({
  email: z.email({ error: "Invalid Email Address" }),
  college: z.enum(["select college"]),
  department: z.enum(["select department"]),
  year_level: z.int().min(0).max(10),
});

export function BugReportForm() {
  const form = useForm({
    defaultValues: {},
  });
}

export default function Form() {
  const supabase = createClient();
  // const { departments, isDepartmentsLoading } = fetchDepartment(supabase);
  // const { colleges, isCollegesLoading } = fetchCollege(supabase);

  return (
    <>
      {/* <CollegeDropdown
        colleges={colleges ?? []}
        isLoading={isCollegesLoading}
      />
      <DepartmentDropdown
        departments={departments ?? []}
        isLoading={isDepartmentsLoading}
      /> */}
    </>
  );
}
