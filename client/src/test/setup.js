import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const storage = (() => {
  let data = {};

  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
    clear: () => {
      data = {};
    },
  };
})();

beforeEach(() => {
  vi.stubGlobal("localStorage", storage);
});

afterEach(() => {
  cleanup();
  storage.clear();
  vi.unstubAllGlobals();
});