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

interface FieldMeta {
  isTouched: boolean;
  isValid: boolean;
  errors?: Array<{ message?: string } | undefined>;
}

interface FieldState<TValue> {
  value?: TValue | null;
  meta: FieldMeta;
}

interface FieldLike<TValue = number> {
  name: string;
  state: FieldState<TValue>;
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
}

interface FormYearLevelProps<TValue = number> {
  field: FieldLike<TValue>;
  enableDescription?: boolean;
}

export default function FormYearLevelField({
  field,
  enableDescription = true,
}: FormYearLevelProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Year Level</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value ? field.state.value.toString() : ""}
        onValueChange={(value) => field.handleChange(Number(value))}
      >
        <SelectTrigger id="select-year-level" aria-invalid={isInvalid}>
          <SelectValue placeholder="Select Year Level" />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {[
            { year: "1", name: "1st Year" },
            { year: "2", name: "2nd Year" },
            { year: "3", name: "3rd Year" },
            { year: "4", name: "4th Year" },
            { year: "5", name: "5th Year" },
          ].map((data, idx) => (
            <SelectItem value={data.year} key={idx}>
              {data.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : (
        <FieldDescription>
          {enableDescription && "Ensure the year level is valid"}
        </FieldDescription>
      )}
    </Field>
  );
}
