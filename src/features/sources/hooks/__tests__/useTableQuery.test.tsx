import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useTableQuery } from "../useTableQuery";
import type { QueryResult } from "../../types";

const mockInvoke = vi.mocked(invoke);

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const result: QueryResult = { columns: ["id", "name"], rows: [[1, "Alice"]], total: 1 };

beforeEach(() => { mockInvoke.mockReset(); });

describe("useTableQuery", () => {
  it("does not fetch when table is null", () => {
    renderHook(() => useTableQuery({ sourceId: "s1", table: null }), { wrapper: wrapper() });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("fetches data when table is set", async () => {
    mockInvoke.mockResolvedValue(result);
    const { result: hook } = renderHook(
      () => useTableQuery({ sourceId: "s1", table: "users" }),
      { wrapper: wrapper() },
    );

    await waitFor(() => expect(hook.current.result).toEqual(result));
    expect(mockInvoke).toHaveBeenCalledWith("source_query", {
      id: "s1",
      query: { table: "users", limit: 50, offset: 0, order_by: undefined },
    });
  });

  it("resets to page 1 when table changes", async () => {
    mockInvoke.mockResolvedValue(result);
    const { result: hook, rerender } = renderHook(
      ({ table }: { table: string }) => useTableQuery({ sourceId: "s1", table }),
      { wrapper: wrapper(), initialProps: { table: "users" } },
    );

    await waitFor(() => expect(hook.current.result).toBeTruthy());
    act(() => { hook.current.setPage(3); });
    expect(hook.current.page).toBe(3);

    rerender({ table: "orders" });
    await waitFor(() => expect(hook.current.page).toBe(1));
  });

  it("toggleOrder cycles asc → desc → null", () => {
    mockInvoke.mockResolvedValue(result);
    const { result: hook } = renderHook(
      () => useTableQuery({ sourceId: "s1", table: "users" }),
      { wrapper: wrapper() },
    );

    act(() => { hook.current.toggleOrder("name"); });
    expect(hook.current.orderBy).toEqual({ column: "name", direction: "asc" });

    act(() => { hook.current.toggleOrder("name"); });
    expect(hook.current.orderBy).toEqual({ column: "name", direction: "desc" });

    act(() => { hook.current.toggleOrder("name"); });
    expect(hook.current.orderBy).toBeNull();
  });
});
