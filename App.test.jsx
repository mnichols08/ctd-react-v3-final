import { render } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import App from "./src/App";
import { InventoryProvider } from "./src/context/InventoryProvider";
import { MemoryRouter } from "react-router-dom";

test("app loads without console errors", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <MemoryRouter initialEntries={["/"]}>
      <InventoryProvider>
        <App />
      </InventoryProvider>
    </MemoryRouter>,
  );
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});
