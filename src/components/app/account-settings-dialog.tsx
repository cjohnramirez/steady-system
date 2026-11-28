"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { SteadyMascot } from "@/components/app/steady-mascot";
import { UserAvatar } from "@/components/app/user-avatar";
import { useSignedInViewer } from "@/components/viewer-provider";
import { createClient } from "@/utils/supabase/client";
import { updateOwnAdminProfile } from "@/lib/admin/actions";
import { abbreviateProgram } from "@/lib/format";
import { fetchColleges, fetchDepartments } from "@/lib/reference/queries";
import { queryKeys } from "@/lib/query-keys";

type ContactChannel = "Phone" | "Email" | "Facebook" | "WhatsApp" | "Custom";

interface ContactItem {
  id: string;
  channel: ContactChannel;
  value: string;
}

const CHANNELS: ContactChannel[] = [
  "Phone",
  "Email",
  "Facebook",
  "WhatsApp",
  "Custom",
];

const YEAR_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
];

/**
 * Role-aware Account Settings Modal:
 * - Counselor: Guidance Directory Profile (Figma 678:18154)
 * - Student: Student Profile (Figma 678:19627)
 * - Admin: Reduced Account Settings
 */
export function AccountSettingsDialog({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "student" | "counselor" | "admin";
}) {
  const viewer = useSignedInViewer();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    viewer.avatar ?? null,
  );

  // Shared / Admin / Student personal fields
  const [firstName, setFirstName] = useState(viewer.firstName);
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState(viewer.lastName);
  const [suffix, setSuffix] = useState("");
  const [username, setUsername] = useState(viewer.userName);
  const [phone, setPhone] = useState("");
  const [universityId, setUniversityId] = useState("");

  // Student-specific fields
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [yearLevel, setYearLevel] = useState("3");
  const [studentBio, setStudentBio] = useState("A student trying their best.");
  const [scholarship, setScholarship] = useState("");

  // Counselor-specific fields (Figma 678:18154)
  const [contacts, setContacts] = useState<ContactItem[]>([
    { id: "c-email", channel: "Email", value: viewer.email ?? "" },
  ]);
  const [newChannel, setNewChannel] = useState<ContactChannel>("Phone");
  const [newContactValue, setNewContactValue] = useState("");
  const [room, setRoom] = useState(
    "Guidance & Counseling Office, West Hall Room 204",
  );
  const [counselorBio, setCounselorBio] = useState(
    "Licensed Guidance Counselor supporting undergraduate students with academic burnout recovery, stress management, and personal adjustment.",
  );

  const colleges = useQuery({
    queryKey: queryKeys.colleges,
    queryFn: () => fetchColleges(supabase),
    enabled: open && role === "student",
    staleTime: Infinity,
  });

  const effectiveCollegeId = collegeId || colleges.data?.[0]?.id || "";

  const departments = useQuery({
    queryKey: queryKeys.departments(effectiveCollegeId),
    queryFn: () => fetchDepartments(supabase, effectiveCollegeId),
    enabled: open && role === "student" && Boolean(effectiveCollegeId),
    staleTime: Infinity,
  });

  function handleAvatarPick(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  function handleAddContact() {
    if (!newContactValue.trim()) return;
    setContacts((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        channel: newChannel,
        value: newContactValue.trim(),
      },
    ]);
    setNewContactValue("");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (role === "admin") {
        const res = await updateOwnAdminProfile({
          first_name: firstName.trim() || viewer.firstName,
          last_name: lastName.trim() || viewer.lastName,
          username: username.trim() || viewer.userName,
          phone: phone.trim() || "09000000000",
          university_id: Number(universityId) || 2024000001,
        });
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success("Admin account updated.");
        router.refresh();
        onOpenChange(false);
        return;
      }

      if (role === "student") {
        const { error } = await supabase
          .from("student")
          .update({
            first_name: firstName.trim() || viewer.firstName,
            middle_name: middleName.trim(),
            last_name: lastName.trim() || viewer.lastName,
            ...(effectiveCollegeId ? { college_id: effectiveCollegeId } : {}),
            ...(departmentId ? { department_id: departmentId } : {}),
            year_level: Number(yearLevel) || 1,
          })
          .eq("id", viewer.profileId);

        if (error) {
          toast.error(error.message || "Could not update student profile.");
          return;
        }
        toast.success("Student profile updated.");
        router.refresh();
        onOpenChange(false);
        return;
      }

      // Counselor
      const phoneEntry = contacts.find((c) => c.channel === "Phone")?.value;
      const { error } = await supabase
        .from("counselor")
        .update({
          ...(phoneEntry ? { phone: phoneEntry } : {}),
        })
        .eq("id", viewer.profileId);

      if (error) {
        toast.error(error.message || "Could not update counselor profile.");
        return;
      }
      toast.success("Guidance directory profile updated.");
      router.refresh();
      onOpenChange(false);
    });
  }

  const headerTitle =
    role === "counselor"
      ? "Guidance Directory Profile"
      : role === "student"
        ? "Student Profile"
        : "Admin Account Settings";

  const headerDescription =
    role === "counselor"
      ? "This information is shown to students when they choose a counselor."
      : role === "student"
        ? "This information is shown to the counselor. Please ensure every detail is accurate."
        : "Manage your administrator identity and contact details.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        {/* Static Gray Header Band */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            {headerTitle}
          </DialogTitle>
          <DialogDescription className="text-foreground/80 mt-1 text-[15px]">
            {headerDescription}
          </DialogDescription>
        </div>

        {/* Scrollable White Body */}
        <form
          id="account-settings-modal-form"
          onSubmit={handleSave}
          className="divide-border min-h-0 flex-1 divide-y overflow-y-auto text-left"
        >
          {/* Section 1: Edit Profile Picture (Shared across all 3 roles) */}
          <div className="flex items-center justify-between gap-4 p-6">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-foreground text-[15px] font-medium">
                  Edit Profile Picture
                </p>
                <p className="text-muted-foreground max-w-[290px] text-[14px]">
                  {role === "counselor"
                    ? "Choose a picture that can make you recognizable to students."
                    : role === "student"
                      ? "Choose a picture (formal or casual) that can make you recognizable to counselors."
                      : "Choose a profile picture for your administrator account."}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleAvatarPick(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Pencil strokeWidth={1.5} className="size-4" />
                Replace
              </Button>
            </div>

            {avatarPreview ? (
              <UserAvatar
                name={`${firstName} ${lastName}`.trim() || viewer.userName}
                src={avatarPreview}
                className="size-[84px] shrink-0 rounded-[18px]"
              />
            ) : (
              <SteadyMascot
                variant="avatar"
                emotion="default"
                className="size-[84px] shrink-0 rounded-[18px]"
              />
            )}
          </div>

          {/* COUNSELOR BODY (Figma 678:18154) */}
          {role === "counselor" && (
            <>
              <div className="space-y-4 p-6">
                <div className="space-y-1">
                  <p className="text-foreground text-[15px] font-medium">
                    Edit Contact Info
                  </p>
                  <p className="text-muted-foreground text-[14px]">
                    Choose how students can communicate with you.
                  </p>
                </div>

                <div className="space-y-3">
                  {contacts.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Remove ${item.channel}`}
                        onClick={() =>
                          setContacts((prev) =>
                            prev.filter((c) => c.id !== item.id),
                          )
                        }
                        className="shrink-0"
                      >
                        <Trash2 strokeWidth={1.5} className="size-4" />
                      </Button>
                      <Select
                        value={item.channel}
                        onValueChange={(v) =>
                          setContacts((prev) =>
                            prev.map((c) =>
                              c.id === item.id
                                ? { ...c, channel: v as ContactChannel }
                                : c,
                            ),
                          )
                        }
                      >
                        <SelectTrigger className="shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANNELS.map((ch) => (
                            <SelectItem key={ch} value={ch}>
                              {ch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={item.value}
                        onChange={(e) =>
                          setContacts((prev) =>
                            prev.map((c) =>
                              c.id === item.id
                                ? { ...c, value: e.target.value }
                                : c,
                            ),
                          )
                        }
                        className="min-w-0 flex-1 rounded-[25px]"
                      />
                    </div>
                  ))}

                  {/* Add Contact Row */}
                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!newContactValue.trim()}
                      onClick={handleAddContact}
                      aria-label="Add contact channel"
                      className="shrink-0"
                    >
                      <Plus strokeWidth={1.5} className="size-4" />
                    </Button>
                    <Select
                      value={newChannel}
                      onValueChange={(v) => setNewChannel(v as ContactChannel)}
                    >
                      <SelectTrigger className="shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNELS.map((ch) => (
                          <SelectItem key={ch} value={ch}>
                            {ch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={newContactValue}
                      onChange={(e) => setNewContactValue(e.target.value)}
                      placeholder="Enter contact handle or URL"
                      className="min-w-0 flex-1 rounded-[25px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="counselor-room"
                    className="text-[15px] font-medium"
                  >
                    Physical Consultation Room
                  </Label>
                  <Input
                    id="counselor-room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="rounded-[25px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="counselor-bio"
                    className="text-[15px] font-medium"
                  >
                    Bio and Focus Areas
                  </Label>
                  <Textarea
                    id="counselor-bio"
                    rows={4}
                    value={counselorBio}
                    onChange={(e) => setCounselorBio(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* STUDENT BODY (Figma 678:19627) */}
          {role === "student" && (
            <>
              <div className="space-y-4 p-6">
                <div className="space-y-1">
                  <p className="text-foreground text-[15px] font-medium">
                    Edit Personal Info
                  </p>
                  <p className="text-muted-foreground text-[14px]">
                    Type accurate and timely information for counselors to
                    provide better services to you.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="stu-first"
                      className="text-[15px] font-medium"
                    >
                      First Name
                    </Label>
                    <Input
                      id="stu-first"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="rounded-[25px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="stu-middle"
                      className="text-[15px] font-medium"
                    >
                      Middle Name (Optional)
                    </Label>
                    <Input
                      id="stu-middle"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Enter middle name"
                      className="rounded-[25px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="stu-last"
                      className="text-[15px] font-medium"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="stu-last"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="rounded-[25px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="stu-suffix"
                      className="text-[15px] font-medium"
                    >
                      Suffix (Optional)
                    </Label>
                    <Input
                      id="stu-suffix"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      placeholder="e.g. Jr., III"
                      className="rounded-[25px]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="stu-college"
                      className="text-[15px] font-medium"
                    >
                      College
                    </Label>
                    <Select
                      value={effectiveCollegeId}
                      onValueChange={(v) => {
                        setCollegeId(v);
                        setDepartmentId("");
                      }}
                    >
                      <SelectTrigger id="stu-college" className="w-full">
                        <SelectValue placeholder="College" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>College</SelectLabel>
                          {(colleges.data ?? []).map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.abbreviation || c.full_name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="stu-program"
                      className="text-[15px] font-medium"
                    >
                      Program
                    </Label>
                    <Select
                      value={departmentId}
                      onValueChange={setDepartmentId}
                    >
                      <SelectTrigger id="stu-program" className="w-full">
                        <SelectValue placeholder="Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Program</SelectLabel>
                          {(departments.data ?? []).map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {abbreviateProgram(d.title)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="stu-year"
                      className="text-[15px] font-medium"
                    >
                      Year
                    </Label>
                    <Select value={yearLevel} onValueChange={setYearLevel}>
                      <SelectTrigger id="stu-year" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEAR_OPTIONS.map((y) => (
                          <SelectItem key={y.value} value={y.value}>
                            {y.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stu-bio" className="text-[15px] font-medium">
                    Describe yourself here
                  </Label>
                  <Textarea
                    id="stu-bio"
                    rows={3}
                    value={studentBio}
                    onChange={(e) => setStudentBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 p-6">
                <div className="space-y-1">
                  <p className="text-foreground text-[15px] font-medium">
                    Edit Scholarship Info
                  </p>
                  <p className="text-muted-foreground text-[14px]">
                    Provide your scholarship information here for additional
                    context.
                  </p>
                </div>
                <Input
                  value={scholarship}
                  onChange={(e) => setScholarship(e.target.value)}
                  placeholder="e.g. DOST-JLSS, Academic Scholar (Optional)"
                  className="rounded-[25px]"
                />
              </div>
            </>
          )}

          {/* ADMIN BODY (Reduced Options) */}
          {role === "admin" && (
            <div className="space-y-4 p-6">
              <div className="space-y-1">
                <p className="text-foreground text-[15px] font-medium">
                  Administrator Details
                </p>
                <p className="text-muted-foreground text-[14px]">
                  Signed in as {viewer.email}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="adm-first"
                    className="text-[15px] font-medium"
                  >
                    First Name
                  </Label>
                  <Input
                    id="adm-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-[25px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adm-last" className="text-[15px] font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="adm-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-[25px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adm-user" className="text-[15px] font-medium">
                    Username
                  </Label>
                  <Input
                    id="adm-user"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-[25px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="adm-phone"
                    className="text-[15px] font-medium"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="adm-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="rounded-[25px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adm-uid" className="text-[15px] font-medium">
                  University ID
                </Label>
                <Input
                  id="adm-uid"
                  type="number"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  placeholder="2024000001"
                  className="rounded-[25px]"
                />
              </div>
            </div>
          )}
        </form>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="submit"
            form="account-settings-modal-form"
            variant="positive"
            loading={isPending}
          >
            Update Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
