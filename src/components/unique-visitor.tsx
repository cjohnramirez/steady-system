"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/stores/auth-store";

export default function InitVisitor() {
  const initUniqueVisitor = useUserStore((state) => state.initUniqueVisitor);

  useEffect(() => {
    initUniqueVisitor();
  }, []);

  return null;
}
