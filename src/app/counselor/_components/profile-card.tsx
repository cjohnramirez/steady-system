"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCog, UserPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailList } from "@/components/app/detail-list";
import { SectionCard } from "@/components/app/section-card";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { createClient } from "@/utils/supabase/client";
import { fetchCounselorDetails } from "@/lib/counselors/queries";
import { formatClockTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import ProfileDialog from "./profile-dialog";
import AvailabilityDialog from "./availability-dialog";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProfileCard() {
  const viewer = useSignedInViewer();
  const supabase = useMemo(() => createClient(), []);
  const [editing, setEditing] = useState<"profile" | "availability" | null>(
    null,
  );

  const counselor = useQuery({
    queryKey: queryKeys.counselors.detail(viewer.profileId),
    queryFn: () => fetchCounselorDetails(supabase, viewer.profileId),
  });

  const c = counselor.data;
  const fullName = `${viewer.firstName} ${viewer.lastName}`.trim();
  const workingDays = c?.day_of_week
    ?.map((on, i) => (on ? DAYS[i] : null))
    .filter(Boolean)
    .join(", ");

  return (
    <SectionCard
      title="Your profile"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing("availability")}
            disabled={!c}
          >
            <CalendarCog aria-hidden />
            Availability
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing("profile")}
            disabled={!c}
          >
            <UserPen aria-hidden />
            Edit
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <UserAvatar name={fullName} src={viewer.avatar} size="md" />
        <div className="min-w-0">
          <p className="truncate font-medium">{fullName}</p>
          <p className="text-muted-foreground truncate">@{viewer.userName}</p>
          {c && (
            <Badge
              variant={c.is_active ? "secondary" : "outline"}
              className="mt-1"
            >
              {c.is_active
                ? "Accepting appointments"
                : "Not accepting appointments"}
            </Badge>
          )}
        </div>
      </div>
      <DetailList
        isLoading={counselor.isLoading}
        items={[
          { label: "Email", value: c?.email },
          { label: "Phone", value: c?.phone },
          { label: "Working days", value: workingDays },
          {
            label: "Hours",
            value: c
              ? `${formatClockTime(c.start_time)} – ${formatClockTime(c.end_time)}`
              : null,
          },
          {
            label: "Departments",
            value: c?.department ?? "None assigned yet. Ask an administrator.",
          },
        ]}
      />

      {c && editing === "profile" && (
        <ProfileDialog
          open
          onOpenChange={(open) => setEditing(open ? "profile" : null)}
          counselor={c}
        />
      )}
      {c && editing === "availability" && (
        <AvailabilityDialog
          open
          onOpenChange={(open) => setEditing(open ? "availability" : null)}
          counselor={c}
        />
      )}
    </SectionCard>
  );
}
