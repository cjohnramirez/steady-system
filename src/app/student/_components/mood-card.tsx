"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "@/components/app/section-card";
import { useSignedInViewer } from "@/components/viewer-provider";
import { createClient } from "@/utils/supabase/client";
import { fetchEmotionalStatuses } from "@/lib/reference/queries";
import { updateOwnEmotionalStatus } from "@/lib/students/actions";
import { queryKeys } from "@/lib/query-keys";
import { strToTitleCase } from "@/lib/format";

/**
 * How the student is feeling, which curates the portal.
 *
 * The old dropdown saved the mood but never refreshed the profile or the portal's
 * copy of it, so the portal kept using the mood from the last login. Refreshing the
 * router re-reads the viewer in the layouts.
 */
export default function MoodCard() {
  const viewer = useSignedInViewer();
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);
  const [isPending, startTransition] = useTransition();

  const moods = useQuery({
    queryKey: queryKeys.emotionalStatus,
    queryFn: () => fetchEmotionalStatuses(supabase),
    staleTime: Infinity,
  });

  const current =
    moods.data?.find((mood) => mood.name === viewer.emotionalStatus)?.id ?? "";

  const choose = (id: string) => {
    if (!id || id === current) return;
    startTransition(async () => {
      const result = await updateOwnEmotionalStatus(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Thanks for sharing. We've updated your recommendations.");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.students.detail(viewer.profileId),
      });
      router.refresh();
    });
  };

  return (
    <SectionCard
      title="How are you feeling?"
      description="We'll suggest articles and playlists that fit."
    >
      {moods.isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-9" />
          ))}
        </div>
      ) : (
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={2}
          value={current}
          onValueChange={choose}
          disabled={isPending}
          aria-label="Your mood"
          className="grid w-full grid-cols-2"
        >
          {(moods.data ?? []).map((mood) => (
            <ToggleGroupItem
              key={mood.id}
              value={mood.id}
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {strToTitleCase(mood.name)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </SectionCard>
  );
}
