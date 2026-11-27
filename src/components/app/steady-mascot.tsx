"use client";

import { useEffect, useId, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SteadyMascotProps {
  /** Color tone: default brand blue (#2b7fff) matching Figma 678:17585. */
  tone?: "blue" | "emerald";
  /** Cursor tracking activation radius in px. Set 0 to disable. */
  proximityRadius?: number;
  /** Enable natural blinking animation. */
  blink?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Interactive Steady Brand Mascot (Figma 678:17585 / Frame 35).
 * Features natural eye blinking and smooth cursor-proximity eye/orb tracking.
 */
export function SteadyMascot({
  tone = "blue",
  proximityRadius = 260,
  blink = true,
  className,
  "aria-label": ariaLabel = "Steady mascot",
}: SteadyMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const filterId = useId();
  const prefersReduced = useReducedMotion();
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Proximity-based cursor tracking
  useEffect(() => {
    if (prefersReduced || proximityRadius <= 0) return;

    let frame = 0;

    function handleMove(event: PointerEvent) {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist > proximityRadius || dist === 0) {
          setGaze((prev) =>
            prev.x === 0 && prev.y === 0 ? prev : { x: 0, y: 0 },
          );
          return;
        }

        // Smooth strength curve: strongest near the mascot, fades to 0 at radius edge
        const strength = 1 - dist / proximityRadius;
        const nx = (dx / dist) * strength;
        const ny = (dy / dist) * strength;
        setGaze({ x: nx, y: ny });
      });
    }

    function handleLeave() {
      setGaze({ x: 0, y: 0 });
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerleave", handleLeave, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, [prefersReduced, proximityRadius]);

  // Natural periodic blinking
  useEffect(() => {
    if (prefersReduced || !blink) return;

    let openTimer = 0;
    let nextTimer = 0;

    function scheduleBlink() {
      const delay = 3200 + Math.random() * 2600;
      nextTimer = window.setTimeout(() => {
        setIsBlinking(true);
        openTimer = window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    }

    scheduleBlink();
    return () => {
      window.clearTimeout(nextTimer);
      window.clearTimeout(openTimer);
    };
  }, [prefersReduced, blink]);

  const orbFill = tone === "emerald" ? "#34d399" : "#51a2ff";

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden select-none",
        tone === "emerald" ? "bg-positive" : "bg-primary",
        className,
      )}
    >
      <m.svg
        viewBox="0 0 53.16 53.16"
        className="pointer-events-none absolute top-[4%] -left-[32%] size-[134%]"
        animate={{
          x: gaze.x * 3.5,
          y: gaze.y * 3.5,
          rotate: -24.73 + gaze.x * 4,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.6 }}
      >
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="57.16"
            height="57.16"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="4" dy="4" />
            <feGaussianBlur stdDeviation="4.05" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_mascot"
            />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          <circle cx="26.58" cy="26.58" r="26.58" fill={orbFill} />
        </g>

        {/* Eyes group: subtle parallax + natural blink */}
        <m.g
          animate={{
            x: gaze.x * 4.5,
            y: gaze.y * 4.5,
            scaleY: isBlinking ? 0.1 : 1,
          }}
          style={{ transformOrigin: "33px 19px" }}
          transition={
            isBlinking
              ? { duration: 0.08, ease: "easeInOut" }
              : { type: "spring", stiffness: 320, damping: 22 }
          }
        >
          <rect
            x="26.54"
            y="14.10"
            width="5.06"
            height="11.25"
            rx="2.53"
            transform="rotate(-9.91 26.54 14.10)"
            fill="white"
          />
          <rect
            x="34.97"
            y="12.41"
            width="5.06"
            height="11.25"
            rx="2.53"
            transform="rotate(-9.91 34.97 12.41)"
            fill="white"
          />
        </m.g>
      </m.svg>
    </div>
  );
}
