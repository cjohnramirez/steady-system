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
import { Spinner } from "@/components/ui/spinner";
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
 *
 * Options that come from the database pass `isLoading` and `isError`: the trigger
 * says so and stays disabled, instead of opening an empty list. `emptyLabel`
 * explains an empty list, such as a college with no departments yet.
 */
export function FormSelectField<TValue extends string | number = string>({
  field,
  label,
  options,
  placeholder = "Select",
  description,
  disabled,
  parse,
  isLoading = false,
  isError = false,
  emptyLabel = "Nothing to choose from yet",
}: {
  field: FieldLike<TValue>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  description?: ReactNode;
  disabled?: boolean;
  /** Converts the select's string back to the field's type, e.g. Number. */
  parse?: (value: string) => TValue;
  isLoading?: boolean;
  isError?: boolean;
  emptyLabel?: string;
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
        disabled={disabled || isLoading || isError}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={invalid}
          aria-busy={isLoading || undefined}
          className="w-full"
        >
          {isLoading ? (
            <span className="text-muted-foreground flex items-center gap-2">
              <Spinner aria-hidden />
              Loading…
            </span>
          ) : isError ? (
            <span className="text-muted-foreground">
              Couldn&apos;t load the options
            </span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">
              {emptyLabel}
            </p>
          ) : (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
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
