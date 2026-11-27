"use client";

import { useState } from "react";
import {
  BookOpen,
  CalendarPlus,
  ClipboardList,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionCard } from "@/components/app/section-card";
import { SteadyMascot } from "@/components/app/steady-mascot";
import { UserAvatar } from "@/components/app/user-avatar";
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
import { ProposedBookingDialog } from "@/components/counselor/proposed-booking-dialog";
import { PendingSessionDetailsDialog } from "@/components/counselor/pending-session-details-dialog";
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
  const [statusFilter, setStatusFilter] = useState("pending");
  const [step, setStep] = useState(0);
  const [switchOn, setSwitchOn] = useState(true);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [counselorOpen, setCounselorOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);
  const [proposedBookingOpen, setProposedBookingOpen] = useState(false);
  const [pendingDetailsOpen, setPendingDetailsOpen] = useState(false);
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

        {/* Tier 0: Brand Mascot & Custom Figma Dropdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="0. Animated Brand Mascot (Default Profile Pic)"
            description="Move your cursor near the mascots to test proximity tracking and natural blinking."
          >
            <div className="flex flex-wrap items-end gap-5">
              <div className="flex flex-col items-center gap-2">
                <UserAvatar
                  name="Maria dela Cruz"
                  className="size-[51px] rounded-[10px]"
                />
                <span className="text-muted-foreground text-xs">
                  Default (51px)
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <UserAvatar
                  name="Marcus Vance"
                  className="size-[84px] rounded-[20px]"
                />
                <span className="text-muted-foreground text-xs">
                  Medium (84px)
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-[120px] overflow-hidden rounded-[28px]">
                  <SteadyMascot tone="blue" />
                </div>
                <span className="text-muted-foreground text-xs">
                  Hero Blue (120px)
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-[84px] overflow-hidden rounded-[20px]">
                  <SteadyMascot tone="emerald" />
                </div>
                <span className="text-muted-foreground text-xs">
                  Emerald Variant
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Custom Figma Dropdown (678:19099)"
            description="Symmetrical left/right trigger padding with Figma rounded-[15px] popover."
          >
            <div className="flex flex-wrap items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[233px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="declined">
                      Declined and Referred
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground text-sm">
                Selected:{" "}
                <strong className="text-foreground">{statusFilter}</strong>
              </span>
            </div>
          </SectionCard>
        </div>

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
            <Button
              variant="outline"
              onClick={() => setProposedBookingOpen(true)}
            >
              <CalendarPlus className="text-primary size-4" />
              Open Proposed Booking
            </Button>
            <Button
              variant="outline"
              onClick={() => setPendingDetailsOpen(true)}
            >
              <ClipboardList className="text-primary size-4" />
              Open Pending Session Details
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
          previewOnly
          session={{
            id: "demo-apt-1",
            studentId: "demo-stu-1",
            studentName: "Gabriel Cruz",
            studentUniversityId: "2023 789 4560",
            courseAndYear: "BS Civil Engineering, 3rd Year",
            scheduledLabel: "1:00 PM - 1:50 PM",
            reason:
              "I feel like I'm drowning in hydraulics and steel design. During group problem sets, I just sit there nodding while my brain goes numb. I skipped lunch for three days because I can't stomach food.",
            status: "approved",
            urgency: "high",
            emergencyContactName: "Sophie Carter (Sister)",
            emergencyContactPhone: "0917 987 6543",
            durationMinutes: 30,
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
        role="counselor"
      />
      <WarmReferralDialog
        previewOnly
        open={referralOpen}
        onOpenChange={setReferralOpen}
        studentId="11111111-1111-1111-1111-111111111111"
        studentName="Marcus Vance"
        studentMeta="2024-338-5519 | BSCE, 3rd Year"
        counselors={[
          {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Dr. Clara Mendoza, RGC",
            specialty: "Clinical Psychologist",
          },
          {
            id: "33333333-3333-3333-3333-333333333333",
            name: "Dr. Luis Ramos, RGC",
            specialty: "Academic Counselor",
          },
        ]}
      />
      <CounselorDetailsDialog
        open={counselorOpen}
        onOpenChange={setCounselorOpen}
        counselor={{
          id: "22222222-2222-2222-2222-222222222222",
          name: "Maria dela Cruz",
          roleTitle: "Lead Counselor, RGC",
          department: "College of Engineering & Architecture",
          email: "maria.delacruz@steady.edu",
          officeRoom: "West Hall Room 204",
          dutyStatus: "available",
          officeHours: "08:30 AM – 05:00 PM",
          availableWeekdays: [2, 3, 5, 6],
          bio: "Licensed Guidance Counselor working primarily with engineering and science undergraduates. Specializes in situational panic, academic burnout recovery, first-generation student adjustment, and high-stakes family pressure.",
        }}
      />
      <ArticleReaderDialog
        open={articleOpen}
        onOpenChange={setArticleOpen}
        article={{
          id: "demo-art-1",
          title: "Understanding Academic Burnout",
          author: "Clara Wren",
          mood: "Stressed",
          lastReadLabel: "Last Read Aug 28, 2026",
          writtenAgoLabel: "Written 7 months ago",
          summary:
            "Academic burnout is more than feeling tired during midterms or finals week.",
          body: [
            "Academic burnout is more than feeling tired during midterms or finals week; it is a state of chronic physical, emotional, and mental exhaustion caused by prolonged academic pressure. Unlike everyday stress—which typically fades once a major exam or deadline passes—burnout leaves students feeling persistently drained, detached from their coursework, and doubtful of their own capabilities even after taking a weekend off.",
            "Early warning signs often show up as difficulty concentrating during lectures, procrastination on routine tasks, disrupted sleep, and growing cynicism toward classes or group projects. In a university setting, burnout is frequently driven by overlapping deadlines, perfectionism, and trying to balance heavy coursework with extracurricular or personal obligations without setting sustainable boundaries.",
            "Recovering from academic burnout starts with recognizing those signals early and scaling back non-essential commitments to restore baseline energy. Breaking large assignments into smaller daily milestones, protecting regular sleep hours, and scheduling true screen-free breaks help rebuild focus gradually.",
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
          universityId: "2024-219-7731",
          department: "BSCE",
          yearLevel: 3,
          emotionalStatus: "Lonely",
          emergencyContactName: "Elena Vance (Mother)",
          emergencyContactPhone: "0917 555 0192",
          primaryReason: "Midterm Panic & Chronic Sleep Debt",
          previousNoteSummary:
            "Responds well to somatic breathwork. Monitoring recovery from OS midterm exam crunch.",
          completedSessions: 4,
          totalSessions: 12,
        }}
      />
      <ProposedBookingDialog
        previewOnly
        open={proposedBookingOpen}
        onOpenChange={setProposedBookingOpen}
        counselorName="Maria dela Cruz, RGC"
        students={[
          { id: "11111111-1111-1111-1111-111111111111", name: "Marcus Vance" },
          { id: "22222222-2222-2222-2222-222222222222", name: "Gabriel Cruz" },
        ]}
      />
      <PendingSessionDetailsDialog
        open={pendingDetailsOpen}
        onOpenChange={setPendingDetailsOpen}
        onReferral={() => {
          setPendingDetailsOpen(false);
          setReferralOpen(true);
        }}
        onReschedule={() => {
          setPendingDetailsOpen(false);
          setProposedBookingOpen(true);
        }}
        session={{
          id: "demo-pending-1",
          studentName: "Marcus Vance",
          studentUniversityId: "2023-951-0842",
          courseAndYear: "BSCE, 3rd Year",
          scheduledLabel: "Nov 16, 2026, 6:00 PM",
          emergencyContactName: "Elena Vance (Mother)",
          emergencyContactPhone: "0917 555 0192",
          reason:
            "During circuit board oral defense yesterday, my throat completely seized up and I couldn't get words out. Prof told me if I can't present my breadboard tomorrow, that's an automatic INC. I'm terrified to walk into the lab.",
        }}
      />
    </div>
  );
}
