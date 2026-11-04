import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ModeratorDashboard from "../pages/ModeratorDashboard.jsx";

const mocks = vi.hoisted(() => ({
  getSpaces: vi.fn(),
  updateSpace: vi.fn(),
  getSpaceReports: vi.fn(),
}));

vi.mock("../api/spacesApi.js", () => ({
  createSpace: vi.fn(),
  deactivateSpace: vi.fn(),
  getSpaces: mocks.getSpaces,
  resetSampleData: vi.fn(),
  updateSpace: mocks.updateSpace,
}));

vi.mock("../api/reportsApi.js", () => ({
  getSpaceReports: mocks.getSpaceReports,
}));

const existingSpace = {
  id: "qa-space-id",
  name: "QA-only space",
  building: "QA Building",
  area: "Original area",
  description: "QA-only listing.",
  facilities: ["Wi-Fi"],
  quietZone: false,
  groupStudyAllowed: true,
  active: true,
  createdAt: "2026-11-03T10:00:00.000Z",
  updatedAt: "2026-11-03T10:00:00.000Z",
};

beforeEach(() => {
  mocks.getSpaces.mockReset().mockResolvedValue([existingSpace]);
  mocks.updateSpace.mockReset().mockResolvedValue(existingSpace);
  mocks.getSpaceReports.mockReset().mockResolvedValue([]);
});

describe("moderator space editor", () => {
  it("omits server-managed fields from the update payload", async () => {
    render(
      <MemoryRouter>
        <ModeratorDashboard />
      </MemoryRouter>,
    );

    await screen.findByRole("button", { name: "Edit" });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Area"), {
      target: { value: "Edited QA area" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(mocks.updateSpace).toHaveBeenCalledTimes(1));
    expect(mocks.updateSpace).toHaveBeenCalledWith("qa-space-id", {
      name: "QA-only space",
      building: "QA Building",
      area: "Edited QA area",
      description: "QA-only listing.",
      facilities: ["Wi-Fi"],
      quietZone: false,
      groupStudyAllowed: true,
      active: true,
    });
  });
});
