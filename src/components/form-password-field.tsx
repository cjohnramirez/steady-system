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
} from "./ui/input-group";
import { Eye, EyeClosed } from "lucide-react";

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

interface FormPasswordFieldProps<TValue = string> {
  field: FieldLike<TValue>;
  showPassword: boolean,
  setShowPassword: (value: React.SetStateAction<boolean>) => void;
}

export default function FormPasswordField({
  field,
  showPassword,
  setShowPassword,
}: FormPasswordFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={field.name}
          name={field.name}
          value={field.state.value || ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          type={showPassword ? "text" : "password"}
          placeholder="Create a secure password"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Toggle password visibility"
            title="Toggle password visibility"
            size="icon-xs"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? <Eye /> : <EyeClosed />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {isInvalid ? (
        <FieldError
          errors={field.state.meta.errors ? [field.state.meta.errors[0]] : []}
        />
      ) : (
        <FieldDescription>
          Must include uppercase, lowercase, number, special character, and 8-255 characters
        </FieldDescription>
      )}
    </Field>
  );
}
