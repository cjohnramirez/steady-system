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
import { fetchCollege } from "../actions";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

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
  setCollege?: (value: React.SetStateAction<string>) => void;
  enableDescription?: boolean;
}

export default function CollegeDropdown({
  field,
  setCollege,
  enableDescription = true,
}: FormDropdownInputProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const { data: collegeData = [] } = useQuery({
    queryKey: ["college", "all"],
    queryFn: () => fetchCollege(),
  });

  useEffect(() => {
    if (field.state.value && setCollege) setCollege(field.state.value);
  }, [field.state.value, setCollege]);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>College</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value ?? ""}
        onValueChange={(value) => {
          field.handleChange(value);
          if (setCollege) setCollege(value);
        }}
      >
        <SelectTrigger id="select-college" aria-invalid={isInvalid}>
          <SelectValue placeholder="Select College" />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {collegeData.map((college, idx) => (
            <SelectItem
              value={college.id}
              key={idx}
              onClick={() => {
                if (setCollege) setCollege(college.id);
              }}
            >
              {college.abbreviation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : enableDescription ? (
        <FieldDescription>A college must be chosen</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  );
}
