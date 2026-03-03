import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import App from "./App";

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders header, inventory, and footer sections", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Kitchen Inventory", level: 1 }),
    ).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });

  it("renders navigation and inventory content", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "Fridge" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Freezer" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Pantry" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Shopping List" })).toBeTruthy();

    expect(
      screen.getByRole("heading", { name: /Fridge/, level: 2 }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("heading", { name: /Freezer/, level: 2 }),
    ).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: /Pantry/, level: 2 }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /Shopping List/, level: 2 }),
    ).toBeTruthy();
  });

  it("loads without console errors", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(<App />);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
