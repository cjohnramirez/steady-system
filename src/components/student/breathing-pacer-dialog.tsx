"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type PhaseKey = "in" | "hold" | "out";

type Phase = {
  key: PhaseKey;
  label: string;
  seconds: number;
};

const PHASES: readonly Phase[] = [
  { key: "in", label: "Breathe In", seconds: 4 },
  { key: "hold", label: "Hold", seconds: 7 },
  { key: "out", label: "Breathe Out", seconds: 8 },
];

const CYCLE_SECONDS = 4 + 7 + 8;
const MIN_SESSIONS = 1;
const MAX_SESSIONS = 100;
const TICK_SPACING_DEG = 15; // 15° spacing per session tick matching Figma 590:3354
const VISIBLE_TICK_WINDOW = 8; // Render ±8 ticks around the active session so the arc starts at 1 and ends at 100
const DRAG_PX_PER_CLICK = 22; // Drag distance to trigger one magnetic detent click

const CONCENTRIC_RINGS = [288, 438, 554, 684] as const;

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
}

function clampSessions(n: number) {
  return Math.max(MIN_SESSIONS, Math.min(MAX_SESSIONS, Math.round(n)));
}

export function BreathingPacerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [totalSessions, setTotalSessions] = useState(4);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [sessionsLeft, setSessionsLeft] = useState(4);
  const [isDraggingDial, setIsDraggingDial] = useState(false);
  const [magneticPullDeg, setMagneticPullDeg] = useState(0);

  const dragStartRef = useRef<{ x: number; startSessions: number } | null>(
    null,
  );

  function resetAll() {
    setStarted(false);
    setRunning(false);
    setPhaseIdx(0);
    setSecondsLeft(PHASES[0].seconds);
    setSessionsLeft(totalSessions);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetAll();
    onOpenChange(nextOpen);
  }

  function handleBegin() {
    setSessionsLeft(totalSessions);
    setPhaseIdx(0);
    setSecondsLeft(PHASES[0].seconds);
    setStarted(true);
    setRunning(true);
  }

  useEffect(() => {
    if (!open || !running) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        const nextPhaseIdx = (phaseIdx + 1) % PHASES.length;
        setPhaseIdx(nextPhaseIdx);
        if (nextPhaseIdx === 0) {
          setSessionsLeft((left) => {
            if (left <= 1) {
              setRunning(false);
              return 0;
            }
            return left - 1;
          });
        }
        return PHASES[nextPhaseIdx].seconds;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, running, phaseIdx]);

  const phase = PHASES[phaseIdx];
  const isCompleted = started && sessionsLeft === 0;
  const remainingTotalSeconds =
    sessionsLeft > 0
      ? (sessionsLeft - 1) * CYCLE_SECONDS +
        secondsLeft +
        PHASES.slice(phaseIdx + 1).reduce((sum, p) => sum + p.seconds, 0)
      : 0;

  // Always lands on an exact tick multiple (center tick aligned under the white dot) + subtle magnetic pull between clicks
  const dialRotation =
    -(totalSessions - 1) * TICK_SPACING_DEG + magneticPullDeg;

  function handleDialPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingDial(true);
    setMagneticPullDeg(0);
    dragStartRef.current = { x: e.clientX, startSessions: totalSessions };
  }

  function handleDialPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    // Dragging left increases sessions, dragging right decreases
    const rawSteps = -dx / DRAG_PX_PER_CLICK;
    const snappedSteps = Math.round(rawSteps);
    const nextSessions = clampSessions(
      dragStartRef.current.startSessions + snappedSteps,
    );
    setTotalSessions(nextSessions);

    // Subtle magnetic tug between detents before clicking into the next line
    const atBound =
      (nextSessions === MIN_SESSIONS && rawSteps < 0) ||
      (nextSessions === MAX_SESSIONS && rawSteps > 0);
    const remainder = atBound ? 0 : rawSteps - snappedSteps;
    setMagneticPullDeg(-remainder * TICK_SPACING_DEG * 0.35);
  }

  function handleDialPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDraggingDial(false);
    setMagneticPullDeg(0);
    dragStartRef.current = null;
  }

  function handleDialWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const step = e.deltaY < 0 || e.deltaX > 0 ? 1 : -1;
    setTotalSessions((prev) => clampSessions(prev + step));
  }

  function handleDialKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setTotalSessions((prev) => clampSessions(prev + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setTotalSessions((prev) => clampSessions(prev - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setTotalSessions(MIN_SESSIONS);
    } else if (e.key === "End") {
      e.preventDefault();
      setTotalSessions(MAX_SESSIONS);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-[20px] p-5 font-sans sm:max-w-[588px]"
      >
        <DialogTitle className="sr-only">
          4-7-8 Breathing Circuit Breaker
        </DialogTitle>
        <DialogDescription className="sr-only">
          Diaphragmatic breathing to steady your heart rate and vagus nerve
        </DialogDescription>

        {/* Full-bleed Brand Blue Card (Figma 590:3354 & 590:3356 + Completed State) */}
        <div className="bg-primary text-primary-foreground shadow-steady-pill relative flex h-[543px] w-full flex-col justify-between overflow-hidden rounded-[19px] p-7 font-sans sm:p-[30px]">
          {/* Soft inset white highlight matching Figma 590:3356 */}
          {started && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_4px_4px_8.1px_0px_rgba(255,255,255,0.6)]"
            />
          )}

          {/* Top-right Close icon */}
          <button
            type="button"
            aria-label="Close breathing pacer"
            onClick={() => handleOpenChange(false)}
            className="text-primary-foreground/90 hover:text-primary-foreground absolute top-6 right-6 z-30 flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            <X strokeWidth={1.5} className="size-4" />
          </button>

          {!started ? (
            /* VARIANT 1: DEFAULT SETUP WITH DRAGGABLE CIRCULAR DIAL (Figma 590:3354) */
            <>
              <div className="relative z-10 max-w-[350px] space-y-2.5 text-left">
                <h2 className="font-sans text-[40px] leading-none font-normal tracking-tight sm:text-[48px]">
                  4-7-8 Breathing Circuit Breaker
                </h2>
                <p className="text-primary-foreground/90 font-sans text-[15px] leading-snug">
                  Diaphragmatic breathing to steady your heart rate and vagus
                  nerve
                </p>
              </div>

              {/* Interactive Rotary Circular Toggle + Circular Indicator */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="Number of breathing sessions"
                aria-valuemin={MIN_SESSIONS}
                aria-valuemax={MAX_SESSIONS}
                aria-valuenow={totalSessions}
                onPointerDown={handleDialPointerDown}
                onPointerMove={handleDialPointerMove}
                onPointerUp={handleDialPointerUp}
                onPointerCancel={handleDialPointerUp}
                onWheel={handleDialWheel}
                onKeyDown={handleDialKeyDown}
                className={`relative z-10 flex flex-1 touch-none flex-col items-center justify-center select-none focus-visible:outline-none ${
                  isDraggingDial ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                {/* Rotating Circular Tick Wheel (Circular Toggle) */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-[18px] left-1/2 size-[680px] -translate-x-1/2"
                >
                  <svg
                    viewBox="0 0 680 680"
                    className="size-full overflow-visible"
                    style={{
                      transform: `rotate(${dialRotation}deg)`,
                      transition:
                        "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    {Array.from(
                      {
                        length:
                          Math.min(
                            MAX_SESSIONS,
                            totalSessions + VISIBLE_TICK_WINDOW,
                          ) -
                          Math.max(
                            MIN_SESSIONS,
                            totalSessions - VISIBLE_TICK_WINDOW,
                          ) +
                          1,
                      },
                      (_, i) => {
                        const sessionNum =
                          Math.max(
                            MIN_SESSIONS,
                            totalSessions - VISIBLE_TICK_WINDOW,
                          ) + i;
                        const angle = (sessionNum - 1) * TICK_SPACING_DEG;
                        return (
                          <line
                            key={sessionNum}
                            x1={340}
                            y1={14}
                            x2={340}
                            y2={54}
                            stroke="white"
                            strokeWidth={1.75}
                            strokeLinecap="round"
                            transform={`rotate(${angle} 340 340)`}
                          />
                        );
                      },
                    )}
                  </svg>
                </div>

                {/* Fixed Circular Indicator Pointer at Top Center of the Arc */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-[35px] left-1/2 z-20 size-[17px] -translate-x-1/2 rounded-full bg-white"
                />

                {/* Session Count Readout */}
                <div className="relative z-10 flex flex-col items-center gap-2 pt-20">
                  <span className="font-sans text-[64px] leading-none font-normal tabular-nums">
                    {totalSessions}
                  </span>
                  <span className="text-primary-foreground/95 font-sans text-[15px]">
                    {totalSessions === 1 ? "Session" : "Sessions"}
                  </span>
                </div>
              </div>

              {/* Bottom Controls (Figma 593:3535) */}
              <div className="relative z-10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBegin}
                  className="bg-card text-foreground shadow-steady-card flex h-12 cursor-pointer items-center justify-center rounded-[25px] px-5 font-sans text-[15px] font-normal transition-transform active:scale-[0.98]"
                >
                  Begin Session
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex h-12 cursor-pointer items-center justify-center rounded-[25px] bg-white/20 px-5 font-sans text-[15px] font-normal text-white transition-colors hover:bg-white/30"
                >
                  Close
                </button>
              </div>
            </>
          ) : isCompleted ? (
            /* VARIANT 3: SESSIONS COMPLETED CELEBRATION ANIMATION */
            <>
              {/* Gently Expanding Settled Rings */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                {CONCENTRIC_RINGS.map((size, idx) => (
                  <m.div
                    key={size}
                    className="absolute rounded-full bg-white"
                    style={{ width: size, height: size }}
                    initial={{ scale: 0.72, opacity: 0 }}
                    animate={{
                      scale: [0.92, 1.04, 0.92],
                      opacity: [0.04, 0.14 - idx * 0.02, 0.04],
                    }}
                    transition={{
                      duration: 4.5,
                      delay: idx * 0.25,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 text-center">
                {/* Animated Checkmark Emblem */}
                <m.div
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { scale: 0.5, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="flex size-[88px] items-center justify-center rounded-full bg-white/20 ring-4 ring-white/25"
                >
                  <svg
                    viewBox="0 0 40 40"
                    className="size-10 text-white"
                    fill="none"
                  >
                    <m.path
                      d="M10 20.5L17 27.5L30.5 13.5"
                      stroke="currentColor"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.55,
                        delay: 0.18,
                        ease: "easeInOut",
                      }}
                    />
                  </svg>
                </m.div>

                <m.div
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="max-w-xs space-y-2"
                >
                  <h2 className="font-sans text-[28px] leading-tight font-medium tracking-tight">
                    Sessions Completed
                  </h2>
                  <p className="text-primary-foreground/90 font-sans text-[15px] leading-snug">
                    You completed {totalSessions}{" "}
                    {totalSessions === 1 ? "cycle" : "cycles"} of 4-7-8
                    breathing. Take a calm moment before moving on.
                  </p>
                </m.div>
              </div>

              <div className="relative z-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleBegin}
                  className="bg-card text-foreground shadow-steady-card flex h-12 cursor-pointer items-center justify-center rounded-[25px] px-6 font-sans text-[15px] font-normal transition-transform active:scale-[0.98]"
                >
                  Start Again
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex h-12 cursor-pointer items-center justify-center rounded-[25px] bg-white/20 px-6 font-sans text-[15px] font-normal text-white transition-colors hover:bg-white/30"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            /* VARIANT 2: ACTIVE BREATHING STATE (Figma 590:3356) */
            <>
              {/* Concentric Cascading & Looping Breathing Rings (Smallest -> Largest) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                {CONCENTRIC_RINGS.map((size, idx) => {
                  const isIn = phase.key === "in";
                  const isOut = phase.key === "out";

                  // Breathe In: scale up cascading from smallest to largest with faded opacity on both ends
                  // Hold: calm expanded shimmer
                  // Breathe Out: scale down smoothly with faded opacity on both ends
                  const animateProps = !running
                    ? { scale: 0.94, opacity: 0.1 }
                    : prefersReducedMotion
                      ? {
                          scale: isIn ? 1.05 : isOut ? 0.9 : 1.02,
                          opacity: 0.14,
                        }
                      : isIn
                        ? {
                            scale: [0.76, 1.12],
                            opacity: [0.04, 0.22 - idx * 0.025, 0.04],
                          }
                        : isOut
                          ? {
                              scale: [1.12, 0.76],
                              opacity: [0.04, 0.2 - idx * 0.02, 0.04],
                            }
                          : {
                              scale: [1.06, 1.11, 1.06],
                              opacity: [
                                0.12 - idx * 0.015,
                                0.18 - idx * 0.02,
                                0.12 - idx * 0.015,
                              ],
                            };

                  const transitionProps = !running
                    ? { duration: 0.4, ease: "easeInOut" as const }
                    : isIn
                      ? {
                          duration: 2.2,
                          delay: idx * 0.24,
                          repeat: Infinity,
                          ease: "easeInOut" as const,
                        }
                      : isOut
                        ? {
                            duration: 2.6,
                            delay: idx * 0.24,
                            repeat: Infinity,
                            ease: "easeInOut" as const,
                          }
                        : {
                            duration: 3.2,
                            delay: idx * 0.2,
                            repeat: Infinity,
                            ease: "easeInOut" as const,
                          };

                  return (
                    <m.div
                      key={`${size}-${phase.key}-${running ? "run" : "pause"}`}
                      className="absolute rounded-full bg-white"
                      style={{ width: size, height: size }}
                      initial={
                        isIn
                          ? { scale: 0.76, opacity: 0.04 }
                          : isOut
                            ? { scale: 1.12, opacity: 0.04 }
                            : { scale: 1.06, opacity: 0.12 }
                      }
                      animate={animateProps}
                      transition={transitionProps}
                    />
                  );
                })}
              </div>

              {/* Top Metric Strip (Figma 593:3513) */}
              <div className="relative z-10 flex items-center justify-center gap-10 pt-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-primary-foreground/85 font-sans text-[15px]">
                    Time
                  </span>
                  <span className="font-sans text-[32px] leading-none font-normal tabular-nums">
                    {formatClock(remainingTotalSeconds)}
                  </span>
                </div>
                <span aria-hidden className="h-12 w-px bg-white/35" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-primary-foreground/85 font-sans text-[15px]">
                    Sessions Left
                  </span>
                  <span className="font-sans text-[32px] leading-none font-normal tabular-nums">
                    {sessionsLeft}
                  </span>
                </div>
              </div>

              {/* Center Phase + Big Countdown (Figma 593:3452) */}
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1">
                <span className="font-sans text-[15px]">{phase.label}</span>
                <span className="font-sans text-[64px] leading-none font-normal tabular-nums">
                  {secondsLeft}
                </span>
              </div>

              {/* Bottom 2 Circular Controls (Figma 593:3503) */}
              <div className="relative z-10 flex items-center justify-center gap-2.5 pb-2">
                <button
                  type="button"
                  aria-label={running ? "Pause breathing" : "Resume breathing"}
                  onClick={() => setRunning((r) => !r)}
                  className="shadow-steady-card flex size-[50px] cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-95"
                >
                  {running ? (
                    <Pause strokeWidth={1.5} className="size-5" />
                  ) : (
                    <Play strokeWidth={1.5} className="size-5" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Reset breathing session"
                  onClick={resetAll}
                  className="shadow-steady-card flex size-[50px] cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 active:scale-95"
                >
                  <RotateCcw strokeWidth={1.5} className="size-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
