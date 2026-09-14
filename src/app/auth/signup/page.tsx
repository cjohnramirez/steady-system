import { redirect } from "next/navigation";

export default function SignUpIndex() {
  redirect("/auth/signup/student");
}
