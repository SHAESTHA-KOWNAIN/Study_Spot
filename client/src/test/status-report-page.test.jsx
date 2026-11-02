import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import SpaceDetailsPage from "../pages/SpaceDetailsPage.jsx";
import { resetMockData } from "../services/mockStorage.js";

beforeEach(() => {
  localStorage.clear();
  resetMockData();
  localStorage.setItem("studyspot-mock-user", JSON.stringify({
    id: "test-member",
    name: "Test Student",
    email: "student@example.edu",
    role: "member",
  }));
});

describe("study-space status reporting", () => {
  it("shows the latest report note and adds successful updates without reloading", async () => {
    render(
      <MemoryRouter initialEntries={["/spaces/central-library"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/spaces/:id" element={<SpaceDetailsPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Central Library" })).toBeInTheDocument();
    expect(screen.getAllByText("Plenty of desks on the east side.")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText(/current availability/i), { target: { value: "Busy" } });
    fireEvent.change(screen.getByLabelText(/add a note/i), { target: { value: "Only a few seats remain." } });
    fireEvent.click(screen.getByRole("button", { name: /share an update/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Only a few seats remain.")).toHaveLength(2);
      expect(screen.getByText("3")).toBeInTheDocument();
    });
    expect(screen.getByText("Thanks — your update has been shared.")).toBeInTheDocument();
    expect(screen.getAllByText("Busy").length).toBeGreaterThan(0);
  });
});
