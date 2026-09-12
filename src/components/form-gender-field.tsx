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
import { strToTitleCase } from "@/lib/format";
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
  setCollege?: (value: React.SetStateAction<string>) => void;
  enableDescription?: boolean;
}

const genderObj = ["male", "female", "non-binary", "prefer not to say"];

export default function GenderField({
  field,
  setCollege,
  enableDescription = true,
}: FormDropdownInputProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value ?? ""}
        onValueChange={(value) => {
          field.handleChange(value);
          if (setCollege) setCollege(value);
        }}
      >
        <SelectTrigger id="select-college" aria-invalid={isInvalid}>
          <SelectValue placeholder="Select Gender" />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {genderObj.map((gender, idx) => (
            <SelectItem
              value={gender}
              key={idx}
              onClick={() => {
                if (setCollege) setCollege(gender);
              }}
            >
              {strToTitleCase(gender)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : enableDescription ? (
        <FieldDescription>A gender must be chosen</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  );
}
