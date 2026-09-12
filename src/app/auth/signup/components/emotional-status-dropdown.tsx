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
import { useQuery } from "@tanstack/react-query";
import { fetchEmotionalStatus } from "@/app/admin/accounts/@modal/actions";
import { strToTitleCase } from "@/lib/format";

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
  emotionalStatus: string;
  enableDescription?: boolean;
}

export default function EmotionalStatusDropdown({
  field,
  enableDescription = true,
}: FormDropdownInputProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const {
    data: emotionalStatusData = [],
    isLoading: isEmotionalStatusLoading,
  } = useQuery({
    queryKey: ["emotional-status"],
    queryFn: () => fetchEmotionalStatus(),
  });

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Emotional Status</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value ?? ""}
        onValueChange={field.handleChange}
      >
        <SelectTrigger id="select-emotional-status" aria-invalid={isInvalid}>
          {isEmotionalStatusLoading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <p>Loading Emotional Status</p>
            </div>
          ) : (
            <SelectValue placeholder="Select Emotional Status" />
          )}
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {emotionalStatusData &&
            emotionalStatusData.map((emotion, idx) => (
              <SelectItem value={emotion.id} key={idx}>
                {strToTitleCase(emotion.name)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : enableDescription ? (
        <FieldDescription>An emotional status must be chosen</FieldDescription>
      ) : (
        <></>
      )}
    </Field>
  );
}
