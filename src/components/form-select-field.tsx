"use client";

import type { ReactNode } from "react";
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
import {
  fieldErrors,
  isFieldInvalid,
  type FieldLike,
} from "@/components/form/field-like";

export type SelectOption = { value: string; label: string };

/**
 * A labelled select bound to a TanStack Form field.
 *
 * Replaces the college, department, mood, gender and year-level dropdowns, whose
 * labels pointed at ids the triggers did not have (so clicking a label did nothing
 * and screen readers announced an unlabelled combobox), and two of which shared the
 * id "select-college" on the same page.
 */
export function FormSelectField<TValue extends string | number = string>({
  field,
  label,
  options,
  placeholder = "Select",
  description,
  disabled,
  parse,
}: {
  field: FieldLike<TValue>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: ReactNode;
  disabled?: boolean;
  /** Converts the select's string back to the field's type, e.g. Number. */
  parse?: (value: string) => TValue;
}) {
  const invalid = isFieldInvalid(field);
  const value = field.state.value;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        name={field.name}
        value={
          value === undefined || value === null || value === 0
            ? ""
            : String(value)
        }
        onValueChange={(next) => {
          field.handleChange(parse ? parse(next) : (next as TValue));
          field.handleBlur();
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={invalid}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {invalid ? (
        <FieldError errors={fieldErrors(field)} />
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}
