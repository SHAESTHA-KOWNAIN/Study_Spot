import { describe, expect, it } from "vitest";
import { filterSpaces, getFreshness, latestReport } from "../utils/statusUtils.js";
import { mockSpaces } from "../data/mockSpaces.js";
import { mockReports } from "../data/mockReports.js";

describe("availability helpers", () => {
  it("calculates fresh, stale, and missing reports independently of status", () => {
    const now = new Date("2026-10-29T10:00:00Z").getTime();
    expect(getFreshness("2026-10-29T09:01:00Z", 60, now)).toBe("fresh");
    expect(getFreshness("2026-10-29T09:00:00Z", 60, now)).toBe("stale");
    expect(getFreshness(null, 60, now)).toBe("none");
  });

  it("prefers freshness returned by the backend when provided", () => {
    const now = new Date("2026-10-29T10:00:00Z").getTime();
    expect(getFreshness("2026-10-29T09:30:00Z", 60, now, "Stale")).toBe("stale");
    expect(getFreshness("2026-10-29T09:30:00Z", 60, now, "Fresh", 15)).toBe("stale");
    expect(getFreshness("2026-10-29T09:30:00Z", 5, now, "Fresh", 60)).toBe("fresh");
    expect(getFreshness(null, 60, now, "No Report")).toBe("none");
  });

  it("renders a latest report based on timestamp, not array order", () => {
    const reports = [
      { status: "Busy", createdAt: "2026-10-28T08:00:00Z" },
      { status: "Available", createdAt: "2026-10-29T08:00:00Z" },
    ];
    expect(latestReport(reports).status).toBe("Available");
  });

  it("combines text, status, facilities, and suitability filters", () => {
    const result = filterSpaces(mockSpaces, mockReports, {
      search: "library",
      status: "Available",
      facility: "Wi-Fi",
      quietZone: "true",
      groupStudyAllowed: "false",
    });
    expect(result.map((space) => space.id)).toEqual(["central-library", "quiet-study"]);
  });
});
