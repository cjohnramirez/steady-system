"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Contact, Phone, UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

/**
 * Identity column (avatar, name, counselor, edit button) beside an even grid of
 * details, with emergency contacts as their own section at the foot of the card.
 * The contacts section sits at the bottom (mt-auto) so the card fills the height
 * of the column beside it instead of leaving a gap.
 */
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
  const counselor = s?.counselor_first_name
    ? `${s.counselor_first_name} ${s.counselor_last_name ?? ""}`.trim()
    : null;

  return (
    <SectionCard
      className={className}
      title="Profile"
      description="Keep these details current so your counselor can reach you."
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <div className="flex flex-col gap-4 md:w-52 md:shrink-0">
          <div className="flex items-center gap-4 md:flex-col md:items-start">
            <UserAvatar name={fullName} src={viewer.avatar} size="lg" />
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium">{fullName}</p>
              <p className="text-muted-foreground truncate">
                @{viewer.userName}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">Your counselor</p>
            {student.isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <p className={counselor ? "" : "text-muted-foreground"}>
                {counselor ?? "Not assigned yet"}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEditing("profile")}
            disabled={!s}
          >
            <UserPen aria-hidden />
            Edit profile
          </Button>
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
          ]}
        />
      </div>

      <section
        aria-labelledby="emergency-contacts-title"
        className="mt-auto flex flex-col gap-4 border-t pt-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 id="emergency-contacts-title" className="font-medium">
              Emergency contacts
            </h3>
            <p className="text-muted-foreground">
              Who the guidance office may call if something happens.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing("contacts")}
            disabled={!contacts.data}
          >
            <Contact aria-hidden />
            Edit contacts
          </Button>
        </div>

        {contacts.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : contacts.data && contacts.data.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {contacts.data.map((contact) => {
              const name = [
                contact.first_name,
                contact.middle_name,
                contact.last_name,
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <li
                  key={contact.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <UserAvatar name={name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{name}</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                    >
                      <Phone aria-hidden className="size-3.5" />
                      {contact.phone}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-center">
            No emergency contacts yet. Add at least one.
          </p>
        )}
      </section>

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
