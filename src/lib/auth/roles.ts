import { roles } from "@/types/main";

/**
 * Where each role lands after signing in, and where each role is sent to sign in.
 *
 * Both middleware and the login form read these maps. Keeping them here is what
 * stops the two from drifting: before this existed, middleware redirected
 * counselors to /counselor/dashboard and students to /student/profile, and neither
 * route has ever existed in the app.
 */
export const ROLE_HOME: Record<roles, string> = {
  admin: "/admin/dashboard",
  counselor: "/counselor",
  student: "/student",
};

export const ROLE_LOGIN: Record<roles, string> = {
  admin: "/auth/login/admin",
  counselor: "/auth/login/counselor",
  student: "/auth/login/student",
};

export const ALL_ROLES: roles[] = ["admin", "counselor", "student"];

/** Route prefix each role owns. Used to decide which login page to bounce to. */
export const ROLE_AREA: Record<roles, string> = {
  admin: "/admin",
  counselor: "/counselor",
  student: "/student",
};

export function isRole(value: unknown): value is roles {
  return typeof value === "string" && (ALL_ROLES as string[]).includes(value);
}

/**
 * The role that owns a path, or null for a public one. Middleware uses this to
 * pick both the guard to apply and the login page to redirect to.
 */
export function roleForPath(pathname: string): roles | null {
  for (const role of ALL_ROLES) {
    if (pathname.startsWith(ROLE_AREA[role])) return role;
  }
  return null;
}
