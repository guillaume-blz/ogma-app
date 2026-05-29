import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { DatabaseDriverMeta } from "../types";

let cache: DatabaseDriverMeta[] | null = null;

export function useDatabaseDrivers(): DatabaseDriverMeta[] {
  const [drivers, setDrivers] = useState<DatabaseDriverMeta[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    invoke<DatabaseDriverMeta[]>("source_database_drivers").then((d) => {
      cache = d;
      setDrivers(d);
    });
  }, []);

  return drivers;
}
