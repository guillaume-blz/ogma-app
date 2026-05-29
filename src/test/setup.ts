import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));
