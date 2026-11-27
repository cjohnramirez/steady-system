"use client";

import { useState } from "react";
import {
  BookOpen,
  EyeOff,
  FolderOpen,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/app/section-card";
import { StatusBadge, UrgencyBadge } from "@/components/app/status-badge";
import { PillTabs } from "@/components/app/pill-tabs";
import { Stepper } from "@/components/app/stepper";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePrivacyShield } from "@/components/app/privacy-shield";
import { BreathingPacerDialog } from "@/components/student/breathing-pacer-dialog";
import { ActionPlanCard } from "@/components/student/action-plan-card";
import { CounselorDetailsDialog } from "@/components/student/counselor-details-dialog";
import { ArticleReaderDialog } from "@/components/student/article-reader-dialog";
import { CrisisSupportDialog } from "@/components/app/crisis-dialog";
import { WarmReferralDialog } from "@/components/counselor/warm-referral-dialog";
import { DossierDialog } from "@/components/counselor/dossier-dialog";
import { SessionCard } from "@/components/counselor/session-card";
import { BrandMark } from "@/components/app/brand-mark";

const STEPS = [
  { id: "personal", label: "Personal Info" },
  { id: "contact", label: "Contact Info" },
  { id: "profile", label: "User Profile" },
  { id: "mood", label: "Mood" },
] as const;

export function ComponentShowcase() {
  const [tab, setTab] = useState("all");
  const [step, setStep] = useState(0);
  const [switchOn, setSwitchOn] = useState(true);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [counselorOpen, setCounselorOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const { enabled: privacyOn, toggle: togglePrivacy } = usePrivacyShield();

  return (
    <div className="bg-background min-h-dvh px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <header className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] border p-5">
          <div className="flex items-center gap-4">
            <BrandMark />
            <div className="border-l pl-4">
              <h1 className="text-lg font-semibold">
                Steady Component Showcase
              </h1>
              <p className="text-muted-foreground text-xs">
                Live verification gallery against Figma Login-Section brand
                rules
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={togglePrivacy}>
              <EyeOff className="size-4" />
              Privacy Shield: {privacyOn ? "On" : "Off"} (P)
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Tier 1: Buttons */}
        <SectionCard
          title="1. Buttons (Login-Section Pill Elevation + Inner Shadow)"
          description="All colors read from global CSS variables in src/app/globals.css."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary Action</Button>
            <Button variant="positive">Save Changes</Button>
            <Button variant="outline">Secondary Action</Button>
            <Button variant="destructive">Cancel Session</Button>
            <Button variant="secondary">Subtle</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Saving…</Button>
            <Button disabled>Disabled</Button>
          </div>
        </SectionCard>

        {/* Tier 1: Badges, Inputs, Switches */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="2. Status & Urgency Badges"
            description="Semantic appointment statuses and clinical urgency pills."
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status="pending" />
              <StatusBadge status="approved" />
              <StatusBadge status="completed" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="rejected" />
            </div>
            <div className="flex flex-wrap items-center gap-2.5 border-t pt-4">
              <UrgencyBadge urgency="high" />
              <UrgencyBadge urgency="medium" />
              <UrgencyBadge urgency="low" />
            </div>
          </SectionCard>

          <SectionCard
            title="3. Inputs, Textareas & Switch"
            description="25px pill inputs with Card Elevation and accessible Switch."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="demo-email">Institutional Email</Label>
                <Input id="demo-email" defaultValue="marcus.vance@steady.edu" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-err">Error State</Label>
                <Input
                  id="demo-err"
                  aria-invalid="true"
                  defaultValue="invalid-email"
                />
              </div>
            </div>
            <Textarea
              rows={2}
              placeholder="Write a brief note..."
              className="rounded-[20px]"
            />
            <label className="flex items-center justify-between text-sm">
              <span>Toggle Switch Example</span>
              <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
            </label>
          </SectionCard>
        </div>

        {/* Tier 2: PillTabs & Stepper */}
        <SectionCard
          title="4. Animated PillTabs & 4-Step Stepper"
          description="Shared layoutId spring indicator and animated step transitions."
        >
          <PillTabs
            ariaLabel="Demo appointment filter"
            value={tab}
            onChange={setTab}
            options={[
              { value: "all", label: "All Appointments", count: 15 },
              { value: "approved", label: "Confirmed Upcoming", count: 6 },
              { value: "pending", label: "Pending Review", count: 4 },
              { value: "completed", label: "Past Completed", count: 5 },
              { value: "referrals", label: "Warm Referrals", count: 2 },
            ]}
          />

          <div className="border-t pt-6">
            <Stepper steps={STEPS} currentIndex={step} onStepSelect={setStep}>
              <div className="bg-muted border-border flex flex-wrap items-center justify-between gap-4 rounded-[18px] border p-5">
                <div>
                  <p className="font-medium">
                    Step {step + 1}: {STEPS[step].label}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Click Next or a previous step pill to preview the spring
                    transition.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setStep((s) => (s + 1) % STEPS.length)}
                  >
                    {step === STEPS.length - 1 ? "Restart" : "Next Step"}
                  </Button>
                </div>
              </div>
            </Stepper>
          </div>
        </SectionCard>

        {/* Tier 2: Modals */}
        <SectionCard
          title="5. Interactive Modals & Dialogs"
          description="Click each button to preview the live animated dialogs."
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setBreathingOpen(true)}>
              <Wind className="text-primary size-4" />
              Open 4-7-8 Breathing Pacer
            </Button>
            <Button variant="outline" onClick={() => setReferralOpen(true)}>
              <UserPlus className="text-primary size-4" />
              Open Warm Referral Dialog
            </Button>
            <Button variant="outline" onClick={() => setCounselorOpen(true)}>
              <UserCheck className="text-primary size-4" />
              Open Counselor Details
            </Button>
            <Button variant="outline" onClick={() => setArticleOpen(true)}>
              <BookOpen className="text-primary size-4" />
              Open Article Reader
            </Button>
            <Button variant="outline" onClick={() => setDossierOpen(true)}>
              <FolderOpen className="text-primary size-4" />
              Open Student Dossier
            </Button>
            <Button variant="destructive" onClick={() => setCrisisOpen(true)}>
              <ShieldAlert className="size-4" />
              Open Crisis Support Dialog
            </Button>
          </div>
        </SectionCard>

        {/* Tier 2: Student Post-Session Action Plan */}
        <ActionPlanCard
          previewOnly
          initialItems={[
            {
              id: "demo-1",
              title: "Practice 4-7-8 breathing for 3 minutes before sleeping",
              is_completed: true,
              due_date: "2026-12-01",
            },
            {
              id: "demo-2",
              title:
                "Break down the hydraulics lab into 25-minute Pomodoro blocks",
              is_completed: false,
              due_date: "2026-12-03",
            },
            {
              id: "demo-3",
              title: "Log energy levels after midday lunch for 3 days",
              is_completed: false,
              due_date: "2026-12-05",
            },
          ]}
        />

        {/* Tier 2: Counselor SessionCard */}
        <SessionCard
          session={{
            id: "demo-apt-1",
            studentId: "demo-stu-1",
            studentName: "Gabriel Cruz",
            studentUniversityId: "2023-789-4560",
            courseAndYear: "BS Civil Engineering, 3rd Year",
            scheduledLabel: "1:00 PM – 1:50 PM",
            reason:
              "Feeling overwhelmed by hydraulics and steel design lab deadlines this week.",
            status: "approved",
            urgency: "high",
          }}
          onOpenCrisis={() => setCrisisOpen(true)}
          onOpenReferral={() => setReferralOpen(true)}
        />
      </div>

      <BreathingPacerDialog
        open={breathingOpen}
        onOpenChange={setBreathingOpen}
      />
      <CrisisSupportDialog
        open={crisisOpen}
        onOpenChange={setCrisisOpen}
        role="student"
      />
      <WarmReferralDialog
        open={referralOpen}
        onOpenChange={setReferralOpen}
        studentId="11111111-1111-1111-1111-111111111111"
        studentName="Marcus Vance"
        studentMeta="2023-304-9124 • BS CompEng, 3rd Year"
        counselors={[
          {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Dr. Clara Mendoza, RGC",
          },
          {
            id: "33333333-3333-3333-3333-333333333333",
            name: "Dr. Luis Ramos, RGC",
          },
        ]}
      />
      <CounselorDetailsDialog
        open={counselorOpen}
        onOpenChange={setCounselorOpen}
        counselor={{
          id: "22222222-2222-2222-2222-222222222222",
          name: "Dr. Clara Mendoza, RGC",
          department: "College of Engineering & Architecture",
          email: "clara.mendoza@steady.edu",
          officeRoom: "Guidance Center, Room 204",
          dutyStatus: "available",
          officeHours: "Mon – Fri, 8:00 AM – 5:00 PM",
          bio: "Registered Guidance Counselor specializing in academic stress, burnout recovery, and transition coaching for engineering students.",
        }}
      />
      <ArticleReaderDialog
        open={articleOpen}
        onOpenChange={setArticleOpen}
        onOpenBreathing={() => setBreathingOpen(true)}
        article={{
          id: "demo-art-1",
          title: "Resetting Exam Overwhelm in Five Minutes",
          author: "Dr. Clara Mendoza, RGC",
          mood: "Anxious",
          readMinutes: 3,
          summary:
            "Short physiological resets lower cortisol faster than pushing through fatigue.",
          body: [
            "When deadlines pile up, your nervous system treats an overflowing syllabus like a physical threat. Trying to force concentration while your heart rate is elevated usually backfires.",
            "Before opening your notes, take three slow 4-7-8 breathing cycles and write down just one concrete 20-minute task. Momentum follows regulation, not the other way around.",
          ],
        }}
      />
      <DossierDialog
        open={dossierOpen}
        onOpenChange={setDossierOpen}
        previewOnly
        student={{
          id: "11111111-1111-1111-1111-111111111111",
          name: "Marcus Vance",
          email: "marcus.vance@steady.edu",
          universityId: "2023-304-9124",
          department: "BS Computer Engineering",
          yearLevel: 3,
          emotionalStatus: "Anxious",
          actionItems: [
            {
              id: "d-1",
              title: "Complete 3 breathing resets before midterms",
              is_completed: true,
              due_date: "2026-12-01",
            },
            {
              id: "d-2",
              title: "Share revised study schedule at next check-in",
              is_completed: false,
              due_date: "2026-12-06",
            },
          ],
          recentSessions: [
            {
              id: "s-1",
              dateLabel: "Nov 21, 2026 • 1:00 PM",
              status: "completed",
              reason: "Midterm burnout and sleep schedule disruption",
            },
            {
              id: "s-2",
              dateLabel: "Dec 04, 2026 • 2:00 PM",
              status: "approved",
              reason: "Follow-up on study pacing and sleep log",
            },
          ],
        }}
      />
    </div>
  );
}
