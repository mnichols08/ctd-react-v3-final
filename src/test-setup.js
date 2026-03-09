import { afterEach, beforeEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// jsdom does not implement HTMLDialogElement.showModal / .close
// ---------------------------------------------------------------------------
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function () {
    this.removeAttribute("open");
  };
}

// ---------------------------------------------------------------------------
// Global test setup – Loading/Error state POC (#37)
// ---------------------------------------------------------------------------
// loadSampleData simulates a random loading error (Math.random < 0.33, gated
// behind VITE_SIMULATE_ERRORS) and a 500 ms loading delay via setTimeout.
// These mocks ensure every test gets a deterministic, timer-controlled render
// cycle:
//
//   • Math.random → 1   (always skips the error branch)
//   • Fake timers        (tests call vi.runAllTimers to resolve loading)
//
// Both become harmless no-ops once the simulation is replaced with real API
// calls – no test-file changes required in future PRs.
// ---------------------------------------------------------------------------

let randomSpy;

beforeEach(() => {
  randomSpy = vi.spyOn(Math, "random").mockReturnValue(1);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  randomSpy.mockRestore();
  delete import.meta.env.VITE_SIMULATE_ERRORS;
});
