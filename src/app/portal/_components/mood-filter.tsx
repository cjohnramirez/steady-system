"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { fetchEmotionalStatuses } from "@/lib/reference/queries";
import { strToTitleCase } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export const ALL_MOODS = "all";

export function MoodFilter({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const moods = useQuery({
    queryKey: queryKeys.emotionalStatus,
    queryFn: () => fetchEmotionalStatuses(supabase),
    staleTime: Infinity,
  });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-card w-full sm:w-44" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_MOODS}>Any mood</SelectItem>
        {(moods.data ?? []).map((mood) => (
          <SelectItem key={mood.id} value={mood.id}>
            {strToTitleCase(mood.name)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
