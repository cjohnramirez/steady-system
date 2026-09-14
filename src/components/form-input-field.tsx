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
  optional = false,
  type = "text",
  autoComplete,
  inputMode,
  className,
}: {
  field: FieldLike<TValue>;
  label: string;
  placeholder?: string;
  description?: ReactNode;
  /**
   * Shows "Optional" beside the label. It used to be a description under the input,
   * which made the field taller than its neighbours and threw grid rows out of line.
   */
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  const invalid = isFieldInvalid(field);

  return (
    <Field data-invalid={invalid} className={className}>
      {optional ? (
        <div className="flex items-baseline justify-between gap-2">
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <span className="text-muted-foreground text-xs">Optional</span>
        </div>
      ) : (
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      )}
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
