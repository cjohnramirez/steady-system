import { redirect } from "next/navigation";
import { ROLE_LOGIN } from "@/lib/auth/roles";

export default function LoginIndex() {
  redirect(ROLE_LOGIN.student);
}
