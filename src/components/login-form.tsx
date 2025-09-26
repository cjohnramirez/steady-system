// client

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginForm({ role }: { role: string }) {
  return (
    <form className="flex flex-col gap-4">
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
          <Label htmlFor="email">Password</Label>
          <Link href="/auth/forgot-password">Forgot Password?</Link>
        </div>
        <Input id="password" type="password" required />
      </div>
    </form>
  );
}
