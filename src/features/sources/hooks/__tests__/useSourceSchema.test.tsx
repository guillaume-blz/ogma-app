import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useSourceSchema } from "../useSourceSchema";
import type { Schema } from "../../types";

const mockInvoke = vi.mocked(invoke);

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const schema: Schema = {
  tables: [{ name: "users", columns: [{ name: "id", data_type: "int", nullable: false }] }],
};

beforeEach(() => { mockInvoke.mockReset(); });

describe("useSourceSchema", () => {
  it("fetches schema for a source", async () => {
    mockInvoke.mockResolvedValue(schema);
    const { result } = renderHook(() => useSourceSchema("src-1"), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(schema);
    expect(mockInvoke).toHaveBeenCalledWith("source_schema", { id: "src-1" });
  });

  it("exposes error when backend fails", async () => {
    mockInvoke.mockRejectedValue(new Error("not found"));
    const { result } = renderHook(() => useSourceSchema("src-1"), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("uses a distinct query key per source id", async () => {
    mockInvoke.mockResolvedValue(schema);
    const { result: r1 } = renderHook(() => useSourceSchema("a"), { wrapper: wrapper() });
    const { result: r2 } = renderHook(() => useSourceSchema("b"), { wrapper: wrapper() });

    await waitFor(() => expect(r1.current.isSuccess).toBe(true));
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));
    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });
});
