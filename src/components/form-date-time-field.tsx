"use client";

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
import { fromOfficeInputValue, toOfficeInputValue } from "@/lib/format";

/** A date and time in office (Manila) time, stored as an ISO instant. */
export function FormDateTimeField({
  field,
  label,
  description = "Philippine time",
}: {
  field: FieldLike<string>;
  label: string;
  description?: string;
}) {
  const invalid = isFieldInvalid(field);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        type="datetime-local"
        value={toOfficeInputValue(field.state.value)}
        onChange={(event) =>
          field.handleChange(fromOfficeInputValue(event.target.value))
        }
        onBlur={field.handleBlur}
        aria-invalid={invalid}
      />
      {invalid ? (
        <FieldError errors={fieldErrors(field)} />
      ) : (
        <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}
