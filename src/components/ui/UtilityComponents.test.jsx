import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import EmptyState from "./EmptyState.component";
import QuickStatsBar from "./QuickStatsBar.component";

afterEach(() => {
  cleanup();
});

describe("EmptyState", () => {
  it("renders a contextual empty-state message", () => {
    render(<EmptyState title="pantry" />);

    expect(
      screen.getByText("Items in the pantry will be listed here."),
    ).toBeTruthy();
  });
});

describe("QuickStatsBar", () => {
  it("renders quick stat labels and values", () => {
    render(<QuickStatsBar />);

    expect(
      screen.getByRole("heading", { name: "Total Items", level: 3 }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Expiring Soon", level: 3 }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Low Stock", level: 3 }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Categories", level: 3 }),
    ).toBeTruthy();

    expect(screen.getByText("42")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });
});
