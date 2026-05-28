export type SourceType = "database" | "files" | "api" | "saas";

export type DatabaseDriver = "postgres" | "mysql" | "sqlite";

export interface DatabaseConfig {
  driver: DatabaseDriver;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export type SourceConfig = DatabaseConfig; // extend with | FilesConfig | ApiConfig as needed

export interface Source {
  id: string;
  name: string;
  source_type: SourceType;
  config: SourceConfig;
  created_at: string;
  updated_at: string;
}

// ── Abstract query model ─────────────────────────────────────────────────────

export type FilterOperator =
  | "eq" | "ne" | "gt" | "gte" | "lt" | "lte"
  | "like" | "in" | "is_null" | "is_not_null";

export interface Filter {
  column: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface OrderBy {
  column: string;
  direction: "asc" | "desc";
}

export interface AbstractQuery {
  table: string;
  columns?: string[];
  filters?: Filter[];
  order_by?: OrderBy[];
  limit?: number;
  offset?: number;
}

// ── Results ──────────────────────────────────────────────────────────────────

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  total?: number;
}

export interface ColumnSchema {
  name: string;
  data_type: string;
  nullable: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface Schema {
  tables: TableSchema[];
}
