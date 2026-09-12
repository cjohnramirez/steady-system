import { describe, expect, it } from "vitest";
import {
  ACTIVE_APPOINTMENT_STATUSES,
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_PRESENTATION,
  appointmentStatusBadge,
  appointmentStatusDot,
  appointmentStatusLabel,
  isAppointmentStatus,
  toAppointmentStatus,
} from "./status";

describe("appointment status", () => {
  it("describes every status exactly once", () => {
    expect(Object.keys(APPOINTMENT_STATUS_PRESENTATION).sort()).toEqual(
      [...APPOINTMENT_STATUSES].sort(),
    );
  });

  it("gives each status its own colour, so two never read the same", () => {
    const dots = APPOINTMENT_STATUSES.map(
      (s) => APPOINTMENT_STATUS_PRESENTATION[s].dot,
    );

    expect(new Set(dots).size).toBe(APPOINTMENT_STATUSES.length);
  });

  it("treats only pending and approved as holding a slot", () => {
    expect([...ACTIVE_APPOINTMENT_STATUSES]).toEqual(["pending", "approved"]);
  });

  it("recognises real statuses and rejects everything else", () => {
    expect(isAppointmentStatus("approved")).toBe(true);
    expect(isAppointmentStatus("Approved")).toBe(false);
    expect(isAppointmentStatus("archived")).toBe(false);
    expect(isAppointmentStatus(null)).toBe(false);
    expect(isAppointmentStatus(undefined)).toBe(false);
    expect(isAppointmentStatus(3)).toBe(false);
  });

  it("narrows to undefined rather than passing a bad value through", () => {
    expect(toAppointmentStatus("cancelled")).toBe("cancelled");
    expect(toAppointmentStatus("nonsense")).toBeUndefined();
  });

  describe("rendering", () => {
    it("labels each status", () => {
      expect(appointmentStatusLabel("pending")).toBe("Pending");
      expect(appointmentStatusLabel("rejected")).toBe("Rejected");
    });

    // The three copies this replaced all built the label with
    // String(status)[0].toUpperCase(), which throws on null or an empty string.
    it("survives a null or empty status instead of throwing", () => {
      expect(() => appointmentStatusLabel(null)).not.toThrow();
      expect(appointmentStatusLabel(null)).toBe("Unknown");
      expect(appointmentStatusLabel("")).toBe("Unknown");
      expect(appointmentStatusDot(undefined)).toBe("bg-gray-300");
      expect(appointmentStatusBadge(undefined)).toBe(
        "bg-gray-100 text-gray-800",
      );
    });
  });
});
