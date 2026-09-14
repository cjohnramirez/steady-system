import type { Metadata } from "next";
import { AuthHeading } from "../../_components/auth-shell";
import SignUpForm from "../components/signup-form";

export const metadata: Metadata = { title: "Create a student account" };

export default function StudentSignUpPage() {
  return (
    <>
      <AuthHeading
        title="Create your account"
        description="Register to book appointments with your department's counselor."
      />
      <SignUpForm />
    </>
  );
}
