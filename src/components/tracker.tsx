"use client";

import { useEffect } from "react";
import { updateAnalytics } from "@/app/actions";
import { toAppDateString } from "@/lib/format";

const KEY = "gcs-visit-counted-on";

/**
 * Counts one visit per browser per day.
 *
 * The flag used to be a boolean that never expired, so each browser was counted
 * once ever and the "daily visitors" chart slowly flattened to zero.
 */
export default function TrackHomePage() {
  useEffect(() => {
    const today = toAppDateString(new Date());
    try {
      if (localStorage.getItem(KEY) === today) return;
      localStorage.setItem(KEY, today);
    } catch {
      // Storage can be unavailable (private mode). Counting twice beats crashing.
    }
    void updateAnalytics();
  }, []);

  return null;
}
