"use client";

import { login } from "@/app/auth/login/[role]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "@/lib/types/users";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "./ui/button";

export default function LoginForm({ role }: { role: Users }) {
  const loginReducer = async (
    _state: { error: any } | null,
    formData: FormData,
  ) => {
    return await login(role, formData);
  };

  const [, formAction, pending] = useActionState(loginReducer, null);

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder={`${role}@ustp.edu.ph`}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/auth/forgot-password">Forgot Password?</Link>
        </div>
        <Input id="password" type="password" required />
      </div>
      <Button disabled={pending} type="submit">
        Submit
      </Button>
    </form>
  );
}
