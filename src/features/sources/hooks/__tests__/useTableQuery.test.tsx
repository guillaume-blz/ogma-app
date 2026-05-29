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

const mockResult: QueryResult = { columns: ["id", "name"], rows: [[1, "Alice"]], total: 200 };

beforeEach(() => { mockInvoke.mockReset(); });

describe("useTableQuery", () => {
  it("does not fetch when table is null", () => {
    renderHook(() => useTableQuery({ sourceId: "s1", table: null }), { wrapper: wrapper() });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("fetches data when table is set", async () => {
    mockInvoke.mockResolvedValue(mockResult);
    const { result: hook } = renderHook(
      () => useTableQuery({ sourceId: "s1", table: "users" }),
      { wrapper: wrapper() },
    );

    await waitFor(() => expect(hook.current.rowCount).toBe(200));
    expect(mockInvoke).toHaveBeenCalledWith("source_query", {
      id: "s1",
      query: { table: "users", limit: 50, offset: 0, order_by: undefined },
    });
  });

  it("resets to page 1 when table changes", async () => {
    mockInvoke.mockResolvedValue(mockResult);
    const { result: hook, rerender } = renderHook(
      ({ table }: { table: string }) => useTableQuery({ sourceId: "s1", table }),
      { wrapper: wrapper(), initialProps: { table: "users" } },
    );

    await waitFor(() => expect(hook.current.rowCount).toBeTruthy());
    act(() => { hook.current.table.setPageIndex(2); });
    await waitFor(() => expect(hook.current.table.getState().pagination.pageIndex).toBe(2));

    rerender({ table: "orders" });
    await waitFor(() => expect(hook.current.table.getState().pagination.pageIndex).toBe(0));
  });

  it("sorting: set asc, set desc, then clear", async () => {
    mockInvoke.mockResolvedValue(mockResult);
    const { result: hook } = renderHook(
      () => useTableQuery({ sourceId: "s1", table: "users" }),
      { wrapper: wrapper() },
    );

    await waitFor(() => expect(hook.current.rowCount).toBeTruthy());

    act(() => { hook.current.table.setSorting([{ id: "name", desc: false }]); });
    await waitFor(() => expect(hook.current.table.getState().sorting).toEqual([{ id: "name", desc: false }]));

    act(() => { hook.current.table.setSorting([{ id: "name", desc: true }]); });
    await waitFor(() => expect(hook.current.table.getState().sorting).toEqual([{ id: "name", desc: true }]));

    act(() => { hook.current.table.setSorting([]); });
    await waitFor(() => expect(hook.current.table.getState().sorting).toEqual([]));
  });
});
