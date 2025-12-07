"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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

interface FormInputFieldProps<TValue = string> {
  field: FieldLike<TValue>;
  label: string;
  placeholder: string;
  description?: React.ReactNode;
  type?: string;
}

export function FormInputField<TValue = string>({
  field,
  label,
  placeholder,
  description,
  type = "text",
}: FormInputFieldProps<TValue>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={String(field.state.value ?? "")}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value as TValue)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
      />
      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : (
        <FieldDescription>{description ?? null}</FieldDescription>
      )}
    </Field>
  );
}
