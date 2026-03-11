import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FieldSelector from "./FieldSelector.component";
import { ALL_FIELDS, DEFAULT_VISIBLE_FIELDS } from "../../data/fieldConfig";
import {
  useInventoryUI,
  useInventoryActions,
} from "../../context/InventoryContext";

vi.mock("../../context/InventoryContext", () => ({
  useInventoryUI: vi.fn(),
  useInventoryActions: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

const defaultSet = () => new Set(DEFAULT_VISIBLE_FIELDS);

// ---------------------------------------------------------------------------
// FieldSelector – field visibility tests
// ---------------------------------------------------------------------------
describe("FieldSelector – field visibility", () => {
  let mockToggleField;
  let mockResetFields;

  beforeEach(() => {
    mockToggleField = vi.fn();
    mockResetFields = vi.fn();
    useInventoryUI.mockReturnValue({
      visibleFields: defaultSet(),
    });
    useInventoryActions.mockReturnValue({
      toggleField: mockToggleField,
      resetFields: mockResetFields,
    });
  });

  it("default visible fields are checked on initial render", () => {
    render(<FieldSelector onClose={() => {}} />);

    DEFAULT_VISIBLE_FIELDS.forEach((key) => {
      const field = ALL_FIELDS.find((f) => f.key === key);
      const checkbox = screen.getByRole("checkbox", { name: field.label });
      expect(checkbox.checked).toBe(true);
    });
  });

  it("non-default fields are unchecked on initial render", () => {
    render(<FieldSelector onClose={() => {}} />);

    const nonDefault = ALL_FIELDS.filter(
      (f) => !DEFAULT_VISIBLE_FIELDS.includes(f.key) && !f.alwaysVisible,
    );

    // Check at least a few are unchecked
    nonDefault.slice(0, 3).forEach((field) => {
      const checkbox = screen.getByRole("checkbox", { name: field.label });
      expect(checkbox.checked).toBe(false);
    });
  });

  it("ItemName checkbox is checked and disabled (cannot be hidden)", () => {
    render(<FieldSelector onClose={() => {}} />);

    const itemNameCb = screen.getByRole("checkbox", { name: "Item Name" });
    expect(itemNameCb.checked).toBe(true);
    expect(itemNameCb.disabled).toBe(true);
  });

  it("clicking an unchecked field checkbox calls onToggleField with its key", () => {
    render(<FieldSelector onClose={() => {}} />);

    // "Notes" is not in DEFAULT_VISIBLE_FIELDS
    const notesCb = screen.getByRole("checkbox", { name: "Notes" });
    expect(notesCb.checked).toBe(false);

    fireEvent.click(notesCb);
    expect(mockToggleField).toHaveBeenCalledWith("Notes");
  });

  it("clicking a checked field checkbox calls onToggleField with its key", () => {
    render(<FieldSelector onClose={() => {}} />);

    // "Brand" is in DEFAULT_VISIBLE_FIELDS
    const brandCb = screen.getByRole("checkbox", { name: "Brand" });
    expect(brandCb.checked).toBe(true);

    fireEvent.click(brandCb);
    expect(mockToggleField).toHaveBeenCalledWith("Brand");
  });

  it("clicking Reset to Defaults calls onResetFields", () => {
    useInventoryUI.mockReturnValue({
      visibleFields: new Set(["ItemName"]),
    });
    useInventoryActions.mockReturnValue({
      toggleField: mockToggleField,
      resetFields: mockResetFields,
    });

    render(<FieldSelector onClose={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Reset to Defaults" }));
    expect(mockResetFields).toHaveBeenCalledTimes(1);
  });

  it("clicking Done calls onClose", () => {
    const closeFn = vi.fn();
    render(<FieldSelector onClose={closeFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(closeFn).toHaveBeenCalledTimes(1);
  });

  it("renders dialog with correct accessible role and title", () => {
    render(<FieldSelector onClose={() => {}} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Select Visible Fields")).toBeTruthy();
  });

  it("pressing Escape (cancel event) calls onClose", () => {
    const closeFn = vi.fn();
    render(<FieldSelector onClose={closeFn} />);

    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel"));
    expect(closeFn).toHaveBeenCalledTimes(1);
  });

  it("focuses close button on mount", () => {
    render(<FieldSelector onClose={() => {}} />);

    const closeBtn = screen.getByRole("button", {
      name: "Close field selector",
    });
    expect(document.activeElement).toBe(closeBtn);
  });
});
