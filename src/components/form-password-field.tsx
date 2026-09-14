"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  fieldErrors,
  isFieldInvalid,
  type FieldLike,
} from "@/components/form/field-like";

export default function FormPasswordField({
  field,
  label = "Password",
  description,
  placeholder,
  autoComplete = "current-password",
  labelAction,
}: {
  field: FieldLike<string>;
  label?: string;
  description?: ReactNode;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  /** Rendered at the end of the label row, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const invalid = isFieldInvalid(field);

  return (
    <Field data-invalid={invalid}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {labelAction}
      </div>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={invalid}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            size="icon-xs"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {invalid ? (
        <FieldError errors={fieldErrors(field)} />
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}
