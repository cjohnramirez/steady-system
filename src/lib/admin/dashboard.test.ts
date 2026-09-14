import { describe, expect, it } from "vitest";
import { parseDashboardStats, lastDays } from "./dashboard";

const raw = {
  today: "2026-09-14",
  students: 152,
  counselors: 8,
  appointments_today: 3,
  pending_appointments: 29,
  visitors_30d: 2400,
  series: [
    { date: "2026-09-12", visitors: 10, logins: 2, appointments: 1 },
    { date: "2026-09-13", visitors: 20, logins: 4, appointments: 0 },
    { date: "2026-09-14", visitors: 30, logins: 6, appointments: 3 },
  ],
};

describe("parseDashboardStats", () => {
  it("reads the RPC payload", () => {
    const stats = parseDashboardStats(raw);
    expect(stats.students).toBe(152);
    expect(stats.series).toHaveLength(3);
  });

  it("rejects a payload of the wrong shape instead of rendering NaN", () => {
    expect(() => parseDashboardStats({ students: "many" })).toThrow();
  });
});

describe("lastDays", () => {
  // The 30- and 7-day charts used to be separate requests for subsets of the
  // 90-day data.
  it("slices the tail of the series", () => {
    const stats = parseDashboardStats(raw);
    expect(lastDays(stats.series, 2).map((d) => d.date)).toEqual([
      "2026-09-13",
      "2026-09-14",
    ]);
  });
});
