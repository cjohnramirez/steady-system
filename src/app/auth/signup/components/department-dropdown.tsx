import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { fetchDepartment } from "../actions";
import { useQuery } from "@tanstack/react-query";

interface FieldMeta {
  isTouched: boolean;
  isValid: boolean;
  errors?: Array<{ message?: string } | undefined>;
}

interface FieldState<TValue> {
  value?: TValue | null;
  meta: FieldMeta;
}

interface FieldLike<TValue = string> {
  name: string;
  state: FieldState<TValue>;
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
}

interface FormDropdownInputProps<TValue = string> {
  field: FieldLike<TValue>;
  college: string;
  enableDescription?: boolean;
}

export default function DepartmentDropdown({
  field,
  college,
  enableDescription = true,
}: FormDropdownInputProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const { data: departmentData = [], isLoading: isDepartmentLoading } =
    useQuery({
      queryKey: ["department", college],
      queryFn: () => fetchDepartment(college),
    });

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Department</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value ?? ""}
        onValueChange={field.handleChange}
        disabled={college == ""}
      >
        <SelectTrigger id="select-department" aria-invalid={isInvalid}>
          {isDepartmentLoading && college != "" ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <p>Loading Department</p>
            </div>
          ) : (
            <SelectValue placeholder="Select Deparment" />
          )}
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {departmentData.map((department, idx) => (
            <SelectItem value={department.id} key={idx}>
              {department.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : enableDescription ? (
        <FieldDescription>A department must be chosen</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  );
}
