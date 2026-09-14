"use client";

import { createContext, use, type ReactNode } from "react";
import type { Viewer } from "@/lib/auth/viewer";

const ViewerContext = createContext<Viewer | null>(null);

/**
 * Makes the server-loaded viewer available to client components below a layout.
 *
 * Layouts call `getViewer()` and pass the result in. After anything that changes
 * the viewer (a profile edit, a mood change, signing in or out), call
 * `router.refresh()` and the layouts hand down the new value.
 */
export function ViewerProvider({
  viewer,
  children,
}: {
  viewer: Viewer | null;
  children: ReactNode;
}) {
  return <ViewerContext value={viewer}>{children}</ViewerContext>;
}

/** The viewer, or null when signed out. */
export function useViewer(): Viewer | null {
  return use(ViewerContext);
}

/**
 * The viewer inside a role area, where the layout guard guarantees one exists.
 * Throws rather than letting a query run with an empty id.
 */
export function useSignedInViewer(): Viewer {
  const viewer = use(ViewerContext);
  if (!viewer) {
    throw new Error("useSignedInViewer must be used inside a guarded layout.");
  }
  return viewer;
}
