import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import EmptyState from "./EmptyState.component";
import FilterBar from "./FilterBar.component";
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

describe("FilterBar", () => {
  it("renders search, sort, and filter controls", () => {
    render(<FilterBar />);

    expect(screen.getByLabelText("Search:")).toBeTruthy();
    expect(screen.getByLabelText("Sort by:")).toBeTruthy();
    expect(screen.getByLabelText("Filter by:")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Apply Filter" })).toBeTruthy();
  });

  it("includes expected option sets for sort and filter", () => {
    render(<FilterBar />);

    const sortOptions = screen
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(sortOptions).toContain("Name");
    expect(sortOptions).toContain("Expiration Date");
    expect(sortOptions).toContain("Purchase Date");
    expect(sortOptions).toContain("Quantity");
    expect(sortOptions).toContain("All Items");
    expect(sortOptions).toContain("Expiring Soon");
    expect(sortOptions).toContain("Low Stock");
    expect(sortOptions).toContain("Categories");
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
