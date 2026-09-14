/**
 * The slice of a TanStack Form field that the shared inputs need.
 *
 * Eight field components each declared their own copy of these interfaces.
 */
export interface FieldMeta {
  isTouched: boolean;
  isValid: boolean;
  errors?: Array<{ message?: string } | string | undefined>;
}

export interface FieldLike<TValue = string> {
  name: string;
  state: { value?: TValue | null; meta: FieldMeta };
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
}

type WithMeta = { state: { meta: FieldMeta } };

export function isFieldInvalid(field: WithMeta) {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}

/** FieldError expects `{ message }` objects; zod issues can arrive as strings. */
export function fieldErrors(field: WithMeta) {
  return (field.state.meta.errors ?? [])
    .slice(0, 1)
    .map((error) => (typeof error === "string" ? { message: error } : error));
}
