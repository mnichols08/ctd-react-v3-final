import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import PaginationControls from "./PaginationControls.component";

afterEach(() => {
  cleanup();
});

describe("PaginationControls", () => {
  it("does not render when totalItems is 0", () => {
    render(
      <PaginationControls
        currentPage={1}
        totalItems={0}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
    expect(screen.queryByLabelText("Items per page:")).toBeNull();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(
      <PaginationControls
        currentPage={1}
        totalItems={25}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Next page" }),
    ).not.toBeDisabled();
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();

    rerender(
      <PaginationControls
        currentPage={3}
        totalItems={25}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByText("Page 3 of 3")).toBeTruthy();
  });

  it("calls onPageChange with the next and previous page", () => {
    const onPageChange = vi.fn();

    render(
      <PaginationControls
        currentPage={2}
        totalItems={25}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("changes page size and resets to page 1", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <PaginationControls
        currentPage={3}
        totalItems={50}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Items per page:"), {
      target: { value: "25" },
    });

    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("shows the current item range", () => {
    render(
      <PaginationControls
        currentPage={2}
        totalItems={25}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Showing 11 to 20 of 25 items")).toBeTruthy();
  });

  it("uses the default page size when pageSize is omitted", () => {
    render(
      <PaginationControls
        currentPage={1}
        totalItems={25}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Items per page:")).toHaveValue("10");
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();
  });

  it("supports multiple instances with unique page size ids", () => {
    render(
      <>
        <PaginationControls
          currentPage={1}
          totalItems={25}
          pageSize={10}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          idPrefix="fridge"
        />
        <PaginationControls
          currentPage={1}
          totalItems={25}
          pageSize={10}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
          idPrefix="pantry"
        />
      </>,
    );

    const selects = screen.getAllByLabelText("Items per page:");

    expect(selects).toHaveLength(2);
    expect(selects[0].id).toBe("fridge-page-size-select");
    expect(selects[1].id).toBe("pantry-page-size-select");
  });
});
