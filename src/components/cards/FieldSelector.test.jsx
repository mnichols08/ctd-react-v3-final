import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FieldSelector from "./FieldSelector.component";
import { ALL_FIELDS, DEFAULT_VISIBLE_FIELDS } from "../../data/fieldConfig";

afterEach(() => {
  cleanup();
});

const defaultSet = () => new Set(DEFAULT_VISIBLE_FIELDS);

// ---------------------------------------------------------------------------
// FieldSelector – field visibility tests
// ---------------------------------------------------------------------------
describe("FieldSelector – field visibility", () => {
  it("default visible fields are checked on initial render", () => {
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    DEFAULT_VISIBLE_FIELDS.forEach((key) => {
      const field = ALL_FIELDS.find((f) => f.key === key);
      const checkbox = screen.getByRole("checkbox", { name: field.label });
      expect(checkbox.checked).toBe(true);
    });
  });

  it("non-default fields are unchecked on initial render", () => {
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

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
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    const itemNameCb = screen.getByRole("checkbox", { name: "Item Name" });
    expect(itemNameCb.checked).toBe(true);
    expect(itemNameCb.disabled).toBe(true);
  });

  it("clicking an unchecked field checkbox calls onToggleField with its key", () => {
    const toggle = vi.fn();
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={toggle}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    // "Notes" is not in DEFAULT_VISIBLE_FIELDS
    const notesCb = screen.getByRole("checkbox", { name: "Notes" });
    expect(notesCb.checked).toBe(false);

    fireEvent.click(notesCb);
    expect(toggle).toHaveBeenCalledWith("Notes");
  });

  it("clicking a checked field checkbox calls onToggleField with its key", () => {
    const toggle = vi.fn();
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={toggle}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    // "Brand" is in DEFAULT_VISIBLE_FIELDS
    const brandCb = screen.getByRole("checkbox", { name: "Brand" });
    expect(brandCb.checked).toBe(true);

    fireEvent.click(brandCb);
    expect(toggle).toHaveBeenCalledWith("Brand");
  });

  it("clicking Reset to Defaults calls onResetFields", () => {
    const resetFn = vi.fn();
    render(
      <FieldSelector
        visibleFields={new Set(["ItemName"])}
        onToggleField={() => {}}
        onResetFields={resetFn}
        onClose={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset to Defaults" }));
    expect(resetFn).toHaveBeenCalledTimes(1);
  });

  it("clicking Done calls onClose", () => {
    const closeFn = vi.fn();
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={closeFn}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(closeFn).toHaveBeenCalledTimes(1);
  });

  it("renders dialog with correct accessible role and title", () => {
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Select Visible Fields")).toBeTruthy();
  });

  it("pressing Escape calls onClose", () => {
    const closeFn = vi.fn();
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={closeFn}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(closeFn).toHaveBeenCalledTimes(1);
  });

  it("focuses close button on mount", () => {
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    const closeBtn = screen.getByRole("button", {
      name: "Close field selector",
    });
    expect(document.activeElement).toBe(closeBtn);
  });

  it("traps focus: Tab from last focusable wraps to first", () => {
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    const doneBtn = screen.getByRole("button", { name: "Done" });
    doneBtn.focus();
    expect(document.activeElement).toBe(doneBtn);

    fireEvent.keyDown(document, { key: "Tab" });

    // Should wrap to first focusable (close button)
    const closeBtn = screen.getByRole("button", {
      name: "Close field selector",
    });
    expect(document.activeElement).toBe(closeBtn);
  });

  it("traps focus: Shift+Tab from first focusable wraps to last", () => {
    render(
      <FieldSelector
        visibleFields={defaultSet()}
        onToggleField={() => {}}
        onResetFields={() => {}}
        onClose={() => {}}
      />,
    );

    const closeBtn = screen.getByRole("button", {
      name: "Close field selector",
    });
    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    const doneBtn = screen.getByRole("button", { name: "Done" });
    expect(document.activeElement).toBe(doneBtn);
  });
});
