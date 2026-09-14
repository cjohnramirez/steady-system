"use client";

import type { ReactNode } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  fieldErrors,
  isFieldInvalid,
  type FieldLike,
} from "@/components/form/field-like";

export function FormInputField<TValue = string>({
  field,
  label,
  placeholder,
  description,
  type = "text",
  autoComplete,
  inputMode,
  className,
}: {
  field: FieldLike<TValue>;
  label: string;
  placeholder?: string;
  description?: ReactNode;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  const invalid = isFieldInvalid(field);

  return (
    <Field data-invalid={invalid} className={className}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        // Number fields start at 0 so the form type stays numeric; show that as empty.
        value={
          type === "number" && !field.state.value
            ? ""
            : String(field.state.value ?? "")
        }
        onBlur={field.handleBlur}
        onChange={(event) => {
          const value = event.target.value;
          field.handleChange(
            (type === "number" ? Number(value) : value) as TValue,
          );
        }}
        aria-invalid={invalid}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
      />
      {invalid ? (
        <FieldError errors={fieldErrors(field)} />
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}
