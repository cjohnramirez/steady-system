"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { EyeOff, ShieldAlert } from "lucide-react";
import { steadyTransitions } from "@/lib/motion";

interface PrivacyShieldContextValue {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (value: boolean) => void;
}

const PrivacyShieldContext = createContext<PrivacyShieldContextValue | null>(
  null,
);

/**
 * Desk / Campus Privacy Shield (Shortcut: P).
 * Blurs `.privacy-sensitive` fields with zero layout displacement and renders a
 * floating status pill when active. Disabled while typing inside inputs.
 */
export function PrivacyShieldProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.privacyShield = enabled ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.privacyShield;
    };
  }, [enabled]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "p" || event.key === "P") {
        event.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <PrivacyShieldContext value={{ enabled, toggle, setEnabled }}>
      <AnimatePresence>
        {enabled && (
          <m.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={steadyTransitions.snappy}
            className="bg-foreground text-background shadow-steady-card fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 px-4 py-2 text-xs font-medium"
          >
            <ShieldAlert
              aria-hidden
              className="text-destructive size-4 shrink-0"
            />
            <span>
              <strong>Privacy Shield Active</strong> — Sensitive student details
              are blurred
            </span>
            <button
              type="button"
              onClick={toggle}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium transition-colors hover:bg-white/25"
            >
              <EyeOff aria-hidden className="size-3.5" />
              Unmask
              <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px]">
                P
              </kbd>
            </button>
          </m.div>
        )}
      </AnimatePresence>
      {children}
    </PrivacyShieldContext>
  );
}

export function usePrivacyShield() {
  const ctx = useContext(PrivacyShieldContext);
  if (!ctx) {
    return {
      enabled: false,
      toggle: () => {},
      setEnabled: () => {},
    };
  }
  return ctx;
}
