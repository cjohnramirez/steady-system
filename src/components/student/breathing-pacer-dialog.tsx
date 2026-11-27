"use client";

import { useEffect, useState } from "react";
import * as m from "motion/react-m";
import { Pause, Play, RotateCcw, Wind } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PHASES = [
  { label: "Inhale Slowly", seconds: 4, scale: 1.28 },
  { label: "Hold Gently", seconds: 7, scale: 1.28 },
  { label: "Exhale Completely", seconds: 8, scale: 0.88 },
] as const;

export function BreathingPacerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remaining, setRemaining] = useState<number>(PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setRunning(false);
      setPhaseIdx(0);
      setRemaining(PHASES[0].seconds);
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (!running || !open) return;
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev > 1) return prev - 1;
        const nextIdx = (phaseIdx + 1) % PHASES.length;
        if (nextIdx === 0) setCycles((c) => c + 1);
        setPhaseIdx(nextIdx);
        return PHASES[nextIdx].seconds;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, open, phaseIdx]);

  const phase = PHASES[phaseIdx];

  const handleReset = () => {
    setRunning(false);
    setPhaseIdx(0);
    setRemaining(PHASES[0].seconds);
    setCycles(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wind className="text-primary size-5" />
            4-7-8 Guided Breathing Pacer
          </DialogTitle>
          <DialogDescription>
            Follow the expanding orb to calm racing thoughts before an exam or
            counseling session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-6 py-8">
          <div className="relative flex size-48 items-center justify-center">
            <m.div
              animate={{
                scale: running ? phase.scale : 1,
                opacity: running ? 0.25 : 0.14,
              }}
              transition={{ duration: running ? 1.2 : 0.4, ease: "easeInOut" }}
              className="bg-primary absolute inset-0 rounded-full"
            />
            <m.div
              animate={{ scale: running ? phase.scale * 0.82 : 0.85 }}
              transition={{ duration: running ? 1.2 : 0.4, ease: "easeInOut" }}
              className="bg-primary text-primary-foreground shadow-steady-pill relative flex size-36 flex-col items-center justify-center rounded-full text-center"
            >
              <span className="text-3xl font-semibold tabular-nums">
                {remaining}s
              </span>
              <span className="mt-1 px-2 text-xs font-medium opacity-95">
                {running ? phase.label : "Ready"}
              </span>
            </m.div>
          </div>

          <p className="text-muted-foreground text-sm">
            Completed cycles:{" "}
            <strong className="text-foreground">{cycles}</strong>
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button onClick={() => setRunning((r) => !r)}>
            {running ? (
              <>
                <Pause className="size-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-4" />
                Start Breathing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
