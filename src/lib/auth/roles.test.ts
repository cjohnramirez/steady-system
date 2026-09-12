import { describe, expect, it } from "vitest";
import {
  ALL_ROLES,
  ROLE_AREA,
  ROLE_HOME,
  ROLE_LOGIN,
  isRole,
  roleForPath,
} from "./roles";

describe("role routing", () => {
  it("gives every role a landing page, a login page and an area", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_HOME[role]).toBeTruthy();
      expect(ROLE_LOGIN[role]).toBeTruthy();
      expect(ROLE_AREA[role]).toBeTruthy();
    }
  });

  // Middleware used to send counselors to /counselor/dashboard and students to
  // /student/profile. Neither route existed, so both roles hit a 404 straight
  // after signing in. A landing page must sit inside the area its role owns.
  it("keeps each landing page inside that role's own area", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_HOME[role].startsWith(ROLE_AREA[role])).toBe(true);
    }
  });

  it("routes each area prefix back to its role", () => {
    expect(roleForPath("/admin/dashboard")).toBe("admin");
    expect(roleForPath("/counselor")).toBe("counselor");
    expect(roleForPath("/student/appointment")).toBe("student");
  });

  it("treats public paths as owned by nobody", () => {
    expect(roleForPath("/")).toBeNull();
    expect(roleForPath("/home")).toBeNull();
    expect(roleForPath("/portal")).toBeNull();
    expect(roleForPath("/auth/login/admin")).toBeNull();
  });

  it("recognises real roles only", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("Admin")).toBe(false);
    expect(isRole("superuser")).toBe(false);
    expect(isRole(null)).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});
