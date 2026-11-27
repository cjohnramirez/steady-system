"use client";

import { useEffect, useState } from "react";
import { Minus, Pause, Play, Plus, RotateCcw, X } from "lucide-react";
import { m } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type Phase = {
  label: string;
  seconds: number;
  scale: number;
};

const PHASES: readonly Phase[] = [
  { label: "Breathe In", seconds: 4, scale: 1.12 },
  { label: "Hold", seconds: 7, scale: 1.12 },
  { label: "Breathe Out", seconds: 8, scale: 0.78 },
];

const CYCLE_SECONDS = 4 + 7 + 8;

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;
}

export function BreathingPacerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [totalSessions, setTotalSessions] = useState(4);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [sessionsLeft, setSessionsLeft] = useState(4);

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
  const remainingTotalSeconds =
    sessionsLeft > 0
      ? (sessionsLeft - 1) * CYCLE_SECONDS +
        secondsLeft +
        PHASES.slice(phaseIdx + 1).reduce((sum, p) => sum + p.seconds, 0)
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-[20px] p-5 sm:max-w-[588px]"
      >
        <DialogTitle className="sr-only">
          4-7-8 Breathing Circuit Breaker
        </DialogTitle>
        <DialogDescription className="sr-only">
          Diaphragmatic breathing to steady your heart rate and vagus nerve
        </DialogDescription>

        {/* Full-bleed Brand Blue Card (Figma 590:3354 & 590:3356) */}
        <div className="bg-primary text-primary-foreground shadow-steady-pill relative flex h-[543px] w-full flex-col justify-between overflow-hidden rounded-[19px] p-7 sm:p-8">
          {/* Top-right Close icon */}
          <button
            type="button"
            aria-label="Close breathing pacer"
            onClick={() => handleOpenChange(false)}
            className="text-primary-foreground/90 hover:text-primary-foreground absolute top-6 right-6 z-20 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
          >
            <X className="size-4" />
          </button>

          {!started ? (
            /* DEFAULT STATE (Figma 590:3354) */
            <>
              <div className="relative z-10 max-w-[350px] space-y-2.5 text-left">
                <h2 className="text-[40px] leading-[1.05] font-normal tracking-tight sm:text-[48px]">
                  4-7-8 Breathing Circuit Breaker
                </h2>
                <p className="text-primary-foreground/90 text-[15px] leading-snug">
                  Diaphragmatic breathing to steady your heart rate and vagus
                  nerve
                </p>
              </div>

              {/* Curved Arc Dial + Session Count Selector */}
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/4 rounded-full border-2 border-white/30 bg-white/10"
                />
                <div className="relative z-10 flex flex-col items-center gap-2 pt-8">
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      aria-label="Decrease sessions"
                      onClick={() =>
                        setTotalSessions((s) => Math.max(1, s - 1))
                      }
                      className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="text-[64px] leading-none font-normal tabular-nums">
                      {totalSessions}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase sessions"
                      onClick={() =>
                        setTotalSessions((s) => Math.min(8, s + 1))
                      }
                      className="flex size-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="text-primary-foreground/90 text-[15px]">
                    Sessions
                  </span>
                </div>
              </div>

              {/* Bottom Controls (Figma 593:3535) */}
              <div className="relative z-10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBegin}
                  className="bg-card text-foreground shadow-steady-card rounded-[25px] px-5 py-3.5 text-[15px] font-normal transition-transform active:scale-[0.98]"
                >
                  Begin Session
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-[25px] bg-white/20 px-5 py-3.5 text-[15px] font-normal text-white transition-colors hover:bg-white/30"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            /* ACTIVE BREATHING STATE (Figma 590:3356) */
            <>
              {/* Concentric Animated Breathing Rings */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                {[440, 350, 265, 185].map((size, idx) => (
                  <m.div
                    key={size}
                    className="absolute rounded-full bg-white/12"
                    style={{ width: size, height: size }}
                    animate={{
                      scale: running ? phase.scale : 0.92,
                      opacity: running ? 0.14 + idx * 0.05 : 0.1,
                    }}
                    transition={{
                      duration: running ? phase.seconds : 0.4,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* Top Metric Strip (Figma 593:3513) */}
              <div className="relative z-10 flex items-center justify-center gap-10">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-primary-foreground/85 text-[15px]">
                    Time
                  </span>
                  <span className="text-[32px] leading-none font-normal tabular-nums">
                    {formatClock(remainingTotalSeconds)}
                  </span>
                </div>
                <span aria-hidden className="h-12 w-px bg-white/30" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-primary-foreground/85 text-[15px]">
                    Sessions Left
                  </span>
                  <span className="text-[32px] leading-none font-normal tabular-nums">
                    {sessionsLeft}
                  </span>
                </div>
              </div>

              {/* Center Phase + Big Countdown (Figma 593:3452) */}
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1">
                <span className="text-[15px]">
                  {sessionsLeft === 0 ? "Session Complete" : phase.label}
                </span>
                <span className="text-[64px] leading-none font-normal tabular-nums">
                  {sessionsLeft === 0 ? "0" : secondsLeft}
                </span>
              </div>

              {/* Bottom 2 Circular Controls (Figma 593:3503) */}
              <div className="relative z-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label={running ? "Pause breathing" : "Resume breathing"}
                  onClick={() => {
                    if (sessionsLeft === 0) {
                      handleBegin();
                    } else {
                      setRunning((r) => !r);
                    }
                  }}
                  className="bg-card text-foreground shadow-steady-card flex size-[50px] items-center justify-center rounded-full transition-transform active:scale-95"
                >
                  {running ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Reset breathing session"
                  onClick={resetAll}
                  className="flex size-[50px] items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                >
                  <RotateCcw className="size-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
