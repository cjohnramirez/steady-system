import { redirect } from "next/navigation";

// Importing ./dashboard/page and rendering it as a component made /admin a second
// copy of the dashboard route rather than a pointer to it, which loses that
// route's own metadata and params contract.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
