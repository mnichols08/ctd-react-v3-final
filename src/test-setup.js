import { afterEach, beforeEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Global test setup – Loading/Error state POC (#37)
// ---------------------------------------------------------------------------
// MainContainer simulates a random loading error (Math.random < 0.55) and a
// 1750 ms loading delay via setTimeout.  These mocks ensure every test gets a
// deterministic, timer-controlled render cycle:
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
});
