"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * False during the server render and the first client render, true afterwards.
 *
 * Anything read from the persisted auth store has to be gated on this, because the
 * store is restored from localStorage and the server cannot know what is in it.
 * Rendering the restored value immediately produces a hydration mismatch.
 *
 * This replaces the `useState(false)` plus `useEffect(() => setMounted(true))`
 * pattern that was copied into each navigation bar. That version sets state
 * synchronously inside an effect, which triggers a second render pass and is what
 * the react-hooks lint rule objects to.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
