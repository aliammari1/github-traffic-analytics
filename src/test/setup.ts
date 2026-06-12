// SPDX-License-Identifier: MIT
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });

  // Recharts' ResponsiveContainer measures the DOM; jsdom has no layout engine,
  // so give it a deterministic size to render charts in tests.
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 800,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: 400,
  });
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  vi.restoreAllMocks();
});

afterAll(() => server.close());
