"use client";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import SignUpFormAction from "../actions";
import { FormInputField } from "@/components/form-input-field";
import FormPasswordField from "@/components/form-password-field";
import FormYearLevelField from "@/components/form-year-level-field";
import Link from "next/link";
import CollegeDropdown from "../components/college-dropdown";
import DepartmentDropdown from "../components/department-dropdown";
import EmotionalStatusDropdown from "../components/emotional-status-dropdown";
import GenderField from "@/components/form-gender-field";
import ConsentFormModal from "../components/consent-form-modal";
import { Plus } from "lucide-react";
import { studentInsertFormSchema } from "../schema";

export default function SignUpForm() {
  const router = useRouter();

  const [openConsentForm, setOpenConsentForm] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [college, setCollege] = useState("");
  const [emotionalStatus] = useState("");

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      email: "",
      department_id: "",
      college: "",
      year_level: 0,
      password: "",
      university_id: 0,
      username: "",
      phone: "",
      emotional_status_id: "",
      age: 0,
      gender: "",
      contact_person: [
        {
          first_name: "",
          last_name: "",
          middle_name: "",
          phone: "",
        },
      ],
    },
    validators: {
      onChange: studentInsertFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!consentAccepted) {
        setOpenConsentForm(true);
        return;
      }
      setIsLoading(true);

      try {
        const res = await SignUpFormAction(
          value
        );

        if (res?.error) {
          toast.error(res.error);
          return;
        }

        if (res?.success) {
          toast.success(res.success);
          router.replace("/");
        }
      } catch (error) {
        toast.error("Sign up unsuccessful");
      } finally {
        setIsLoading(false);
        setConsentAccepted(false);
      }
    },
  });

  return (
    <>
      {openConsentForm && (
        <ConsentFormModal
          open={openConsentForm}
          setOpen={setOpenConsentForm}
          onAccept={() => {
            setConsentAccepted(true);
            setOpenConsentForm(false);
            form.handleSubmit();
          }}
        />
      )}
      <div className="w-full space-y-2 text-center">
        <p className="text-4xl font-medium">Hello, Student</p>
        <p>Enter your credentials below to signup</p>
      </div>
      <form
        className="mt-8 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex gap-8">
            <form.Field name="first_name">
              {(field) => (
                <FormInputField
                  field={field}
                  label="First Name"
                  placeholder="Enter your first name"
                  description="First name must be valid"
                />
              )}
            </form.Field>
            <form.Field name="last_name">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Last Name"
                  placeholder="Enter your last name"
                  description="Last name must be valid"
                />
              )}
            </form.Field>
            <form.Field name="middle_name">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Middle Name (Optional)"
                  placeholder="Enter your middle name"
                  description="Only if applicable"
                />
              )}
            </form.Field>
          </div>
          <div className="flex gap-8">
            <form.Field name="username">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Username"
                  placeholder="Enter your username"
                  description="Username must be unique"
                />
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  description="Email must be valid for verification"
                />
              )}
            </form.Field>
          </div>
          <div className="flex gap-8">
            <form.Field name="age">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Age"
                  placeholder="Enter your age"
                  description="Age must be valid"
                  type="number"
                />
              )}
            </form.Field>
            <form.Field name="gender">
              {(field) => <GenderField field={field} />}
            </form.Field>
          </div>
          <div className="flex gap-6">
            <form.Field name="college">
              {(field) => (
                <CollegeDropdown field={field} setCollege={setCollege} />
              )}
            </form.Field>
            <form.Field name="department_id">
              {(field) => (
                <DepartmentDropdown field={field} college={college} />
              )}
            </form.Field>
          </div>
          <div className="flex gap-6">
            <form.Field name="year_level">
              {(field) => <FormYearLevelField field={field} />}
            </form.Field>
            <form.Field name="university_id">
              {(field) => (
                <FormInputField
                  field={field}
                  label="University ID"
                  placeholder="Enter your university ID"
                  description="Enter a valid university ID (student)"
                  type="number"
                />
              )}
            </form.Field>
          </div>
          <div className="flex gap-6">
            <form.Field name="emotional_status_id">
              {(field) => (
                <EmotionalStatusDropdown
                  field={field}
                  emotionalStatus={emotionalStatus}
                />
              )}
            </form.Field>
            <form.Field name="phone">
              {(field) => (
                <FormInputField
                  field={field}
                  label="Phone"
                  placeholder="Enter your phone"
                  description="Enter a valid phone number"
                />
              )}
            </form.Field>
          </div>
          <div className="flex flex-col gap-2">
            <form.Field name="contact_person" mode="array">
              {(contactsField) => (
                <>
                  {(contactsField.state.value).map((_: any, index: number) => (
                    <div key={index} className="rounded-lg border">
                      <h4 className="p-4 text-center font-medium">
                        Contact Person No. {index + 1}
                      </h4>
                      <hr className="w-full" />
                      <div className="flex gap-4 p-4">
                        <form.Field name={`contact_person[${index}].first_name`}>
                          {(field) => (
                            <FormInputField
                              field={field}
                              label="Contact First Name"
                              placeholder="Enter contact first name"
                            />
                          )}
                        </form.Field>

                        <form.Field name={`contact_person[${index}].last_name`}>
                          {(field) => (
                            <FormInputField
                              field={field}
                              label="Contact Last Name"
                              placeholder="Enter contact last name"
                            />
                          )}
                        </form.Field>
                      </div>
                      <div className="flex gap-4 p-4">
                        <form.Field name={`contact_person[${index}].middle_name`}>
                          {(field) => (
                            <FormInputField
                              field={field}
                              label="Contact Middle Name (Optional)"
                              placeholder="Enter contact middle name"
                            />
                          )}
                        </form.Field>
                        <form.Field name={`contact_person[${index}].phone`}>
                          {(field) => (
                            <FormInputField
                              field={field}
                              label="Contact Phone"
                              placeholder="Enter contact phone number"
                            />
                          )}
                        </form.Field>
                      </div>
                      <div className="px-4 pb-4 w-full">
                        {(contactsField.state.value).length > 1 && (
                          <Button
                            type="button"
                            onClick={() => contactsField.removeValue(index)}
                            className="w-full"
                            variant="outline"
                          >
                            Remove Contact
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      contactsField.pushValue({
                        first_name: "",
                        last_name: "",
                        middle_name: "",
                        phone: "",
                      })
                    }
                    variant="outline"
                  >
                    <Plus />
                    Add Contact
                  </Button>
                </>
              )}
            </form.Field>
          </div>
          <form.Field name="password">
            {(field) => (
              <FormPasswordField
                field={field}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            )}
          </form.Field>
        </FieldGroup>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          onClick={() => {
            form.handleSubmit();
          }}
        >
          {isLoading ? (
            <>
              <Spinner />
              <p>Submitting</p>
            </>
          ) : (
            <p>Submit</p>
          )}
        </Button>
        <div className="flex justify-center gap-1">
          <p>Already have an account?</p>
          <Link href="/auth/login/student" className="underline">
            Login
          </Link>
        </div>
      </form>
    </>
  );
}
