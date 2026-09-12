"use client";

import { useEffect } from "react";
import { updateAnalytics } from "@/app/actions";

export default function TrackHomePage() {
  useEffect(() => {
    const hasTracked = localStorage.getItem("visitor_tracked_done");
    if (hasTracked) return;
    updateAnalytics();
    localStorage.setItem("visitor_tracked_done", "true");
  }, []);

  return null;
}
