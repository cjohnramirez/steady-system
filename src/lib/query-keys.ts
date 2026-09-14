/**
 * Every React Query key in the app.
 *
 * Keys are hierarchical: a list key is a prefix of every filtered and paginated
 * variant of that list, so invalidating `queryKeys.articles.all` refreshes all of
 * them at once. Per-user data carries the user's id in the key, so one person's
 * cache can never answer for another's.
 *
 * Before this, keys were bare strings at more than fifty call sites. Mutations
 * invalidated names that no query used ("counselor-profile" after a reschedule),
 * and "student-user" was shared by whoever was signed in.
 */
export const queryKeys = {
  announcements: {
    all: ["announcements"] as const,
    list: (params: object) => ["announcements", "list", params] as const,
    detail: (id: string) => ["announcements", "detail", id] as const,
  },
  articles: {
    all: ["articles"] as const,
    list: (params: object) => ["articles", "list", params] as const,
    detail: (id: string) => ["articles", "detail", id] as const,
  },
  playlists: {
    all: ["playlists"] as const,
    list: (params: object) => ["playlists", "list", params] as const,
    detail: (id: string) => ["playlists", "detail", id] as const,
  },

  students: {
    all: ["students"] as const,
    list: (params: object) => ["students", "list", params] as const,
    detail: (id: string) => ["students", "detail", id] as const,
    contacts: (id: string) => ["students", "contacts", id] as const,
  },
  counselors: {
    all: ["counselors"] as const,
    list: (params: object) => ["counselors", "list", params] as const,
    detail: (id: string) => ["counselors", "detail", id] as const,
    departments: (id: string) => ["counselors", "departments", id] as const,
    forStudent: (studentId: string) =>
      ["counselors", "for-student", studentId] as const,
  },
  admins: {
    detail: (id: string) => ["admins", "detail", id] as const,
  },

  appointments: {
    all: ["appointments"] as const,
    list: (params: object) => ["appointments", "list", params] as const,
    detail: (id: string) => ["appointments", "detail", id] as const,
    forStudent: (studentId: string, params: object = {}) =>
      ["appointments", "student", studentId, params] as const,
    forCounselor: (counselorId: string, params: object = {}) =>
      ["appointments", "counselor", counselorId, params] as const,
    counselorCounts: (counselorId: string) =>
      ["appointments", "counselor-counts", counselorId] as const,
  },
  availableSlots: {
    all: ["available-slots"] as const,
    day: (counselorId: string, day: string) =>
      ["available-slots", counselorId, day] as const,
  },

  notifications: {
    all: (userId: string) => ["notifications", userId] as const,
  },

  dashboard: ["dashboard"] as const,

  emotionalStatus: ["emotional-status"] as const,
  colleges: ["colleges"] as const,
  departments: (collegeId: string) => ["departments", collegeId] as const,
  organization: ["organization"] as const,
} as const;
