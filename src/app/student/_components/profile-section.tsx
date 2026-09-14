"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Contact, UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/app/section-card";
import { DetailList } from "@/components/app/detail-list";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { createClient } from "@/utils/supabase/client";
import {
  fetchContactPersons,
  fetchStudentDetails,
} from "@/lib/students/queries";
import { queryKeys } from "@/lib/query-keys";
import { strToTitleCase } from "@/lib/format";
import ProfileDialog from "./profile-dialog";
import ContactsDialog from "./contacts-dialog";

export default function ProfileSection({ className }: { className?: string }) {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);
  const [editing, setEditing] = useState<"profile" | "contacts" | null>(null);

  const student = useQuery({
    queryKey: queryKeys.students.detail(viewer.profileId),
    queryFn: () => fetchStudentDetails(supabase, viewer.profileId),
  });

  const contacts = useQuery({
    queryKey: queryKeys.students.contacts(viewer.profileId),
    queryFn: () => fetchContactPersons(supabase, viewer.profileId),
  });

  const s = student.data;
  const fullName = [viewer.firstName, viewer.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <SectionCard
      className={className}
      title="Profile"
      description="Keep these details current so your counselor can reach you."
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => setEditing("contacts")}
            disabled={!s}
          >
            <Contact aria-hidden />
            Emergency contacts
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditing("profile")}
            disabled={!s}
          >
            <UserPen aria-hidden />
            Edit profile
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex items-center gap-4 md:w-48 md:flex-col md:items-start">
          <UserAvatar name={fullName} src={viewer.avatar} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-medium">{fullName}</p>
            <p className="text-muted-foreground truncate">@{viewer.userName}</p>
          </div>
        </div>
        <DetailList
          className="flex-1"
          isLoading={student.isLoading}
          items={[
            { label: "Email", value: s?.email },
            { label: "Phone", value: s?.phone },
            { label: "College", value: s?.college_name },
            { label: "Department", value: s?.department },
            {
              label: "Year level",
              value: s?.year_level ? `Year ${s.year_level}` : null,
            },
            { label: "University ID", value: s?.university_id },
            {
              label: "Gender",
              value: s?.gender ? strToTitleCase(s.gender) : null,
            },
            { label: "Age", value: s?.age },
            {
              label: "Counselor",
              value: s?.counselor_first_name
                ? `${s.counselor_first_name} ${s.counselor_last_name ?? ""}`.trim()
                : "No counselor assigned yet",
            },
            {
              label: "Emergency contacts",
              value: contacts.isLoading
                ? null
                : (contacts.data ?? [])
                    .map((c) => `${c.first_name} ${c.last_name} (${c.phone})`)
                    .join(", "),
            },
          ]}
        />
      </div>

      {/* Mounted only while open, so each opening starts from the latest data. */}
      {s && editing === "profile" && (
        <ProfileDialog
          open
          onOpenChange={(open) => setEditing(open ? "profile" : null)}
          student={s}
        />
      )}
      {contacts.data && editing === "contacts" && (
        <ContactsDialog
          open
          onOpenChange={(open) => setEditing(open ? "contacts" : null)}
          studentId={viewer.profileId}
          contacts={contacts.data}
        />
      )}
    </SectionCard>
  );
}
