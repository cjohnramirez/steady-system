/**
 * Every React Query key used in the app.
 *
 * Before this, keys were written as bare strings at 19 call sites, so a list and
 * the mutation meant to refresh it could disagree with no way to notice. Adding a
 * key here and importing it makes that a compile error instead.
 */
export const queryKeys = {
  announcements: ["announcements"] as const,
  announcement: (id: string) => ["announcement", id] as const,

  articles: ["articles"] as const,
  article: (id: string) => ["article", id] as const,

  playlists: ["playlists"] as const,
  playlist: (id: string) => ["playlist", id] as const,

  students: ["students"] as const,
  student: (id: string) => ["student", id] as const,

  counselors: ["counselors"] as const,
  counselor: (id: string) => ["counselor", id] as const,
  counselorProfile: ["counselor-profile"] as const,
  counselorAppointments: ["counselor-appointments"] as const,
  counselorAppointmentCounts: ["count-counselor-appointments"] as const,

  appointments: ["appointments"] as const,
  studentAppointments: ["student-appointments"] as const,
  availableSlots: (counselorId: string, day: string) =>
    ["available-slots", counselorId, day] as const,

  emotionalStatus: ["emotional-status"] as const,
  colleges: ["colleges"] as const,
  departments: ["departments"] as const,
  organization: ["organization"] as const,
} as const;
