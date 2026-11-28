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
import { Eye, EyeOff } from "lucide-react";
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
            className="bg-card/95 text-foreground border-border shadow-steady-card fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3.5 rounded-[25px] border py-2 pr-2.5 pl-3 text-[14px] backdrop-blur-md"
          >
            <span
              aria-hidden
              className="bg-brand-subtle text-primary flex size-8 shrink-0 items-center justify-center rounded-full"
            >
              <EyeOff strokeWidth={1.5} className="size-4" />
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-medium">Privacy Shield Active</span>
              <span className="text-muted-foreground hidden sm:inline">
                Sensitive details are blurred
              </span>
            </span>
            <button
              type="button"
              onClick={toggle}
              className="bg-primary text-primary-foreground shadow-steady-pill inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-transform active:scale-[0.98]"
            >
              <Eye aria-hidden strokeWidth={1.5} className="size-3.5" />
              Unmask
              <kbd className="rounded-full bg-white/20 px-1.5 py-0.5 font-sans text-[11px] leading-none">
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
