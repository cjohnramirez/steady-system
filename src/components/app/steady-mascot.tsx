"use client";

import { useEffect, useId, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type MascotEmotion =
  | "default"
  | "anxious"
  | "overwhelmed"
  | "exhausted"
  | "stressed"
  | "calm"
  | "hopeful"
  | "lonely"
  | "reflective";

export type MascotEyeAnchor = "tl" | "tr" | "bl" | "br" | "center";

export interface SteadyMascotProps {
  /** Color tone when emotion is "default" (brand blue #2b7fff by default). */
  tone?: "blue" | "emerald";
  /** Emotion expression & color matching Figma 678:19349–19440. */
  emotion?: MascotEmotion;
  /** "avatar" renders inside a colored square frame; "orb" renders the circular mascot orb directly. */
  variant?: "avatar" | "orb";
  /** Places the eyes in one of the 4 quadrants (tl, tr, bl, br) or center. */
  eyeAnchor?: MascotEyeAnchor;
  /** Cursor tracking activation radius in px. Set 0 to disable. */
  proximityRadius?: number;
  /** Enable natural blinking (automatically disabled for non-default emotions). */
  blink?: boolean;
  className?: string;
  "aria-label"?: string;
}

const EYE_ANCHOR_OFFSET: Record<MascotEyeAnchor, { x: number; y: number }> = {
  tr: { x: 0, y: 0 },
  tl: { x: -13, y: 0 },
  bl: { x: -13, y: 12 },
  br: { x: 0, y: 12 },
  center: { x: -6.5, y: 6 },
};

const EMOTION_FILL: Record<Exclude<MascotEmotion, "default">, string> = {
  anxious: "var(--emotion-anxious)",
  overwhelmed: "var(--emotion-overwhelmed)",
  exhausted: "var(--emotion-exhausted)",
  stressed: "var(--emotion-stressed)",
  calm: "var(--emotion-calm)",
  hopeful: "var(--emotion-hopeful)",
  lonely: "var(--emotion-lonely)",
  reflective: "var(--emotion-reflective)",
};

function renderEmotionEyes(emotion: MascotEmotion) {
  switch (emotion) {
    case "anxious":
      return (
        <>
          <rect
            x="16.5"
            y="18"
            width="4.6"
            height="12.5"
            rx="2.3"
            transform="rotate(20 18.8 24.2)"
            fill="white"
          />
          <rect
            x="27.5"
            y="18"
            width="4.6"
            height="12.5"
            rx="2.3"
            transform="rotate(-18 29.8 24.2)"
            fill="white"
          />
        </>
      );
    case "overwhelmed":
      return (
        <>
          <rect
            x="15.5"
            y="20"
            width="10.5"
            height="4.8"
            rx="2.4"
            transform="rotate(34 20.7 22.4)"
            fill="white"
          />
          <rect
            x="27.5"
            y="20"
            width="10.5"
            height="4.8"
            rx="2.4"
            transform="rotate(-34 32.7 22.4)"
            fill="white"
          />
        </>
      );
    case "exhausted":
      return (
        <>
          <rect
            x="14.5"
            y="24"
            width="10.5"
            height="3.4"
            rx="1.7"
            transform="rotate(18 19.7 25.7)"
            fill="white"
          />
          <rect
            x="27"
            y="27"
            width="10.5"
            height="3.4"
            rx="1.7"
            transform="rotate(18 32.2 28.7)"
            fill="white"
          />
        </>
      );
    case "stressed":
      return (
        <>
          <rect
            x="17"
            y="21"
            width="4.8"
            height="12"
            rx="2.4"
            transform="rotate(-24 19.4 27)"
            fill="white"
          />
          <rect
            x="28"
            y="21"
            width="4.8"
            height="12"
            rx="2.4"
            transform="rotate(24 30.4 27)"
            fill="white"
          />
        </>
      );
    case "calm":
      return (
        <>
          <path
            d="M15 27.5C15 23.5 23.5 23.5 23.5 27.5"
            stroke="white"
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M28.5 27.5C28.5 23.5 37 23.5 37 27.5"
            stroke="white"
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    case "hopeful":
      return (
        <>
          <rect
            x="17.5"
            y="18.5"
            width="5.6"
            height="13.5"
            rx="2.8"
            transform="rotate(34 20.3 25.2)"
            fill="white"
          />
          <rect
            x="26.5"
            y="22.5"
            width="5.6"
            height="13.5"
            rx="2.8"
            transform="rotate(34 29.3 29.2)"
            fill="white"
          />
        </>
      );
    case "lonely":
      return (
        <>
          <rect x="17" y="25" width="4.4" height="7" rx="2.2" fill="white" />
          <rect x="24" y="25.5" width="4.4" height="7" rx="2.2" fill="white" />
        </>
      );
    case "reflective":
      return (
        <>
          <rect x="19" y="21" width="4.8" height="12" rx="2.4" fill="white" />
          <rect x="33" y="21" width="4.8" height="12" rx="2.4" fill="white" />
        </>
      );
    default:
      return (
        <>
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
        </>
      );
  }
}

/**
 * Interactive Steady Brand Mascot (Figma 678:17585 & Emotion Set 678:19349–19440).
 * Supports 4-direction eye anchoring (tl, tr, bl, br), natural blinking (default only),
 * and cursor-proximity tracking.
 */
export function SteadyMascot({
  tone = "blue",
  emotion = "default",
  variant = "avatar",
  eyeAnchor,
  proximityRadius = 240,
  blink = true,
  className,
  "aria-label": ariaLabel = "Steady Mascot",
}: SteadyMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const filterId = useId();
  const prefersReduced = useReducedMotion();
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const shouldBlink = blink && emotion === "default" && !prefersReduced;

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

        const strength = 1 - dist / proximityRadius;
        setGaze({ x: (dx / dist) * strength, y: (dy / dist) * strength });
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

  // Natural periodic blinking (default mascot only)
  useEffect(() => {
    if (!shouldBlink) return;

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
  }, [shouldBlink]);

  const isOrb = variant === "orb";

  const orbFill =
    emotion !== "default"
      ? EMOTION_FILL[emotion]
      : isOrb
        ? tone === "emerald"
          ? "var(--positive)"
          : "var(--brand)"
        : tone === "emerald"
          ? "#34d399"
          : "#51a2ff";

  const resolvedAnchor: MascotEyeAnchor =
    eyeAnchor ?? (emotion === "default" ? "tr" : "center");
  const baseEye =
    emotion === "default"
      ? EYE_ANCHOR_OFFSET[resolvedAnchor]
      : resolvedAnchor === "center"
        ? { x: 0, y: 0 }
        : {
            x: resolvedAnchor.includes("l") ? -6 : 6,
            y: resolvedAnchor.includes("t") ? -6 : 6,
          };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative flex size-full items-center justify-center select-none",
        isOrb
          ? "overflow-visible"
          : cn(
              "overflow-hidden",
              tone === "emerald" ? "bg-positive" : "bg-primary",
            ),
        className,
      )}
    >
      <m.svg
        viewBox={isOrb ? "-5 -5 63.16 63.16" : "0 0 53.16 53.16"}
        overflow="visible"
        className={cn(
          "pointer-events-none",
          isOrb ? "size-full" : "absolute top-[11%] -left-[32%] size-[140%]",
        )}
        animate={{
          x: gaze.x * (isOrb ? 2 : 1.5),
          y: gaze.y * (isOrb ? 2 : 1.5),
          rotate: isOrb ? gaze.x * 2.5 : -24.73 + gaze.x * 2.5,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24, mass: 0.6 }}
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="objectBoundingBox"
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

        <m.g
          animate={{
            x: baseEye.x + gaze.x * 4,
            y: baseEye.y + gaze.y * 4,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          {emotion === "default" ? (
            <>
              {/* Curved thick-stroke eyes (arc radius 53.16 = 2x orb radius) with center trim-path blink */}
              <m.path
                d="M 28.55 15.85 A 53.16 53.16 0 0 1 29.95 23.05"
                fill="none"
                stroke="white"
                strokeWidth="5.06"
                strokeLinecap="round"
                animate={{
                  pathLength: isBlinking ? 0.01 : 1,
                  pathOffset: isBlinking ? 0.495 : 0,
                }}
                transition={{ duration: 0.095, ease: "easeInOut" }}
              />
              <m.path
                d="M 36.95 14.15 A 53.16 53.16 0 0 1 38.35 21.35"
                fill="none"
                stroke="white"
                strokeWidth="5.06"
                strokeLinecap="round"
                animate={{
                  pathLength: isBlinking ? 0.01 : 1,
                  pathOffset: isBlinking ? 0.495 : 0,
                }}
                transition={{ duration: 0.095, ease: "easeInOut" }}
              />
            </>
          ) : (
            renderEmotionEyes(emotion)
          )}
        </m.g>
      </m.svg>
    </div>
  );
}
