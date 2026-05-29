import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useSourcesQuery } from "../useSourcesQuery";
import type { Source } from "../../types";

const mockInvoke = vi.mocked(invoke);

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const sources: Source[] = [
  { id: "1", name: "Prod DB", source_type: "mysql", config: {} as never },
];

beforeEach(() => { mockInvoke.mockReset(); });

describe("useSourcesQuery", () => {
  it("returns sources on success", async () => {
    mockInvoke.mockResolvedValue(sources);
    const { result } = renderHook(() => useSourcesQuery(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sources);
    expect(mockInvoke).toHaveBeenCalledWith("source_list");
  });

  it("exposes error on failure", async () => {
    mockInvoke.mockRejectedValue(new Error("connection refused"));
    const { result } = renderHook(() => useSourcesQuery(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
