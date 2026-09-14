"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { MailCheck, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { FormInputField } from "@/components/form-input-field";
import FormPasswordField from "@/components/form-password-field";
import { FormSelectField } from "@/components/form-select-field";
import { EmptyState } from "@/components/app/empty-state";
import { fieldErrors } from "@/components/form/field-like";
import { createClient } from "@/utils/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchColleges,
  fetchDepartments,
  fetchEmotionalStatuses,
} from "@/lib/reference/queries";
import { strToTitleCase } from "@/lib/format";
import { PASSWORD_HINT } from "@/lib/validation/fields";
import {
  GENDERS,
  signupSchema,
  type SignupInput,
} from "@/lib/validation/student";
import { signUpStudent } from "../actions";
import ConsentDialog from "./consent-dialog";

const EMPTY_CONTACT = {
  first_name: "",
  middle_name: "",
  last_name: "",
  phone: "",
};

const YEAR_LEVELS = [1, 2, 3, 4, 5, 6].map((year) => ({
  value: String(year),
  label: `Year ${year}`,
}));

const defaultValues: SignupInput = {
  first_name: "",
  middle_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  gender: "" as SignupInput["gender"],
  age: 0,
  year_level: 0,
  college_id: "",
  department_id: "",
  university_id: 0,
  emotional_status_id: "",
  contact_person: [EMPTY_CONTACT],
  consent: false as unknown as true,
};

export default function SignUpForm() {
  const router = useRouter();
  const supabase = createClient();
  const [consentOpen, setConsentOpen] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: signupSchema, onBlur: signupSchema },
    onSubmit: async ({ value }) => {
      const result = await signUpStudent(value);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (result.data.needsConfirmation) {
        setSentTo(value.email);
        return;
      }

      toast.success("Welcome! Your account is ready.");
      router.replace("/student");
      router.refresh();
    },
  });

  const collegeId = useStore(form.store, (state) => state.values.college_id);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const colleges = useQuery({
    queryKey: queryKeys.colleges,
    queryFn: () => fetchColleges(supabase),
    staleTime: Infinity,
  });

  const departments = useQuery({
    queryKey: queryKeys.departments(collegeId),
    queryFn: () => fetchDepartments(supabase, collegeId),
    enabled: Boolean(collegeId),
    staleTime: Infinity,
  });

  const moods = useQuery({
    queryKey: queryKeys.emotionalStatus,
    queryFn: () => fetchEmotionalStatuses(supabase),
    staleTime: Infinity,
  });

  if (sentTo) {
    return (
      <EmptyState
        icon={MailCheck}
        title="Check your email"
        description={`We sent a confirmation link to ${sentTo}. Open it on this device to finish creating your account.`}
        action={
          <Button variant="outline" asChild>
            <Link href="/auth/login/student">Back to log in</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <ConsentDialog
        open={consentOpen}
        onOpenChange={setConsentOpen}
        onAccept={() => {
          form.setFieldValue("consent", true);
          setConsentOpen(false);
        }}
      />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-8">
          <FieldSet>
            <FieldLegend>About you</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="first_name">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="First name"
                    autoComplete="given-name"
                  />
                )}
              </form.Field>
              <form.Field name="middle_name">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Middle name"
                    optional
                    autoComplete="additional-name"
                  />
                )}
              </form.Field>
              <form.Field name="last_name">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Last name"
                    autoComplete="family-name"
                  />
                )}
              </form.Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="age">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Age"
                    type="number"
                    inputMode="numeric"
                  />
                )}
              </form.Field>
              <form.Field name="gender">
                {(field) => (
                  <FormSelectField
                    field={field}
                    label="Gender"
                    options={GENDERS.map((gender) => ({
                      value: gender,
                      label: strToTitleCase(gender),
                    }))}
                  />
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="09171234567"
                    optional
                  />
                )}
              </form.Field>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Enrollment</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="college_id"
                listeners={{
                  onChange: () => form.setFieldValue("department_id", ""),
                }}
              >
                {(field) => (
                  <FormSelectField
                    field={field}
                    label="College"
                    isLoading={colleges.isLoading}
                    isError={colleges.isError}
                    placeholder="Select a college"
                    options={(colleges.data ?? []).map((college) => ({
                      value: college.id,
                      label: college.full_name || college.abbreviation,
                    }))}
                  />
                )}
              </form.Field>
              <form.Field name="department_id">
                {(field) => (
                  <FormSelectField
                    field={field}
                    label="Department"
                    isLoading={departments.isLoading}
                    isError={departments.isError}
                    emptyLabel="No departments in this college yet"
                    disabled={!collegeId}
                    placeholder={
                      collegeId
                        ? "Select a department"
                        : "Choose a college first"
                    }
                    options={(departments.data ?? []).map((department) => ({
                      value: department.id,
                      label: department.title,
                    }))}
                  />
                )}
              </form.Field>
              <form.Field name="year_level">
                {(field) => (
                  <FormSelectField
                    field={field}
                    label="Year level"
                    options={YEAR_LEVELS}
                    parse={Number}
                  />
                )}
              </form.Field>
              <form.Field name="university_id">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="University ID"
                    type="number"
                    inputMode="numeric"
                  />
                )}
              </form.Field>
            </div>
            <form.Field name="emotional_status_id">
              {(field) => (
                <FormSelectField
                  field={field}
                  label="How are you feeling lately?"
                  isLoading={moods.isLoading}
                  isError={moods.isError}
                  description="We use this to suggest articles and playlists. You can change it any time."
                  options={(moods.data ?? []).map((mood) => ({
                    value: mood.id,
                    label: strToTitleCase(mood.name),
                  }))}
                />
              )}
            </form.Field>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Emergency contacts</FieldLegend>
            <form.Field name="contact_person" mode="array">
              {(contacts) => (
                <div className="flex flex-col gap-4">
                  {contacts.state.value.map((_, index) => (
                    <fieldset key={index} className="rounded-xl border p-4">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <legend className="font-medium">
                          Contact {index + 1}
                        </legend>
                        {contacts.state.value.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => contacts.removeValue(index)}
                          >
                            <Trash2 aria-hidden />
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <form.Field
                          name={`contact_person[${index}].first_name`}
                        >
                          {(field) => (
                            <FormInputField field={field} label="First name" />
                          )}
                        </form.Field>
                        <form.Field name={`contact_person[${index}].last_name`}>
                          {(field) => (
                            <FormInputField field={field} label="Last name" />
                          )}
                        </form.Field>
                        <form.Field
                          name={`contact_person[${index}].middle_name`}
                        >
                          {(field) => (
                            <FormInputField
                              field={field}
                              label="Middle name"
                              optional
                            />
                          )}
                        </form.Field>
                        <form.Field name={`contact_person[${index}].phone`}>
                          {(field) => (
                            <FormInputField
                              field={field}
                              label="Phone"
                              type="tel"
                              placeholder="09171234567"
                            />
                          )}
                        </form.Field>
                      </div>
                    </fieldset>
                  ))}
                  {contacts.state.value.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => contacts.pushValue(EMPTY_CONTACT)}
                    >
                      <Plus aria-hidden />
                      Add another contact
                    </Button>
                  )}
                </div>
              )}
            </form.Field>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Account</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="username">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Username"
                    autoComplete="username"
                  />
                )}
              </form.Field>
              <form.Field name="email">
                {(field) => (
                  <FormInputField
                    field={field}
                    label="Email"
                    type="email"
                    autoComplete="email"
                  />
                )}
              </form.Field>
            </div>
            <form.Field name="password">
              {(field) => (
                <FormPasswordField
                  field={field}
                  autoComplete="new-password"
                  description={PASSWORD_HINT}
                />
              )}
            </form.Field>
            <form.Field name="consent">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={invalid}>
                    <Checkbox
                      id={field.name}
                      checked={field.state.value === true}
                      onCheckedChange={(checked) =>
                        field.handleChange((checked === true) as true)
                      }
                      aria-invalid={invalid}
                    />
                    <div className="space-y-1">
                      <label htmlFor={field.name} className="leading-snug">
                        I have read and accept the{" "}
                        <button
                          type="button"
                          className="text-primary dark:text-brand-light underline underline-offset-4"
                          onClick={() => setConsentOpen(true)}
                        >
                          terms and informed consent
                        </button>
                        .
                      </label>
                      {invalid && <FieldError errors={fieldErrors(field)} />}
                    </div>
                  </Field>
                );
              }}
            </form.Field>
          </FieldSet>

          <div className="flex flex-col gap-4">
            <Button type="submit" size="lg" loading={isSubmitting}>
              {isSubmitting ? "Creating your account…" : "Create account"}
            </Button>
            <p className="text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/auth/login/student"
                className="text-foreground underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </div>
        </FieldGroup>
      </form>
    </>
  );
}
