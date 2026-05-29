use async_trait::async_trait;
use sqlx::any::{AnyPoolOptions, AnyArguments, AnyRow};
use sqlx::{Arguments, Row, Column};
use sqlx::TypeInfo;

use crate::sources::models::{DatabaseConfig, DatabaseDriver};
use crate::sources::query::{
    AbstractQuery, FilterOperator, OrderDirection, QueryResult, Schema, TableSchema, ColumnSchema,
};
use crate::ssh::{self, TunnelGuard};
use super::ConnectorError;

pub struct DatabaseConnector {
    config: DatabaseConfig,
}

impl DatabaseConnector {
    pub fn new(config: DatabaseConfig) -> Self {
        Self { config }
    }

    async fn connect(&self) -> Result<(sqlx::AnyPool, Option<TunnelGuard>), ConnectorError> {
        sqlx::any::install_default_drivers();
        let tunnel = if let Some(ssh_cfg) = &self.config.ssh_tunnel {
            Some(
                ssh::open_ssh_tunnel(
                    &ssh::SshConfig::from(ssh_cfg),
                    &self.config.host,
                    self.config.port,
                )
                .await
                .map_err(|e| ConnectorError::Connection(e.to_string()))?,
            )
        } else {
            None
        };
        let (host, port) = ssh::effective_addr(&tunnel, &self.config.host, self.config.port);
        let url = self.config.connection_url_for(host, port);
        let pool = AnyPoolOptions::new()
            .max_connections(3)
            .connect(&url)
            .await
            .map_err(|e| ConnectorError::Connection(e.to_string()))?;
        Ok((pool, tunnel))
    }
}

#[async_trait]
impl super::Connector for DatabaseConnector {
    async fn test_connection(&self) -> Result<(), ConnectorError> {
        let (pool, _tunnel) = self.connect().await?;
        sqlx::query("SELECT 1")
            .execute(&pool)
            .await
            .map(|_| ())
            .map_err(|e| ConnectorError::Connection(e.to_string()))
    }

    async fn fetch_schema(&self) -> Result<Schema, ConnectorError> {
        let (pool, _tunnel) = self.connect().await?;

        let schema_sql = match &self.config.driver {
            DatabaseDriver::Postgres =>
                "SELECT c.table_name, c.column_name, c.data_type, c.is_nullable \
                 FROM information_schema.columns c \
                 JOIN information_schema.tables t \
                   ON c.table_name = t.table_name AND c.table_schema = t.table_schema \
                 WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE' \
                 ORDER BY c.table_name, c.ordinal_position"
                    .to_string(),
            DatabaseDriver::Mysql | DatabaseDriver::Mariadb => format!(
                "SELECT c.table_name, c.column_name, c.data_type, c.is_nullable \
                 FROM information_schema.columns c \
                 JOIN information_schema.tables t \
                   ON c.table_name = t.table_name AND c.table_schema = t.table_schema \
                 WHERE c.table_schema = '{}' AND t.table_type = 'BASE TABLE' \
                 ORDER BY c.table_name, c.ordinal_position",
                self.config.database
            ),
            DatabaseDriver::Sqlite =>
                "SELECT m.name AS table_name, p.name AS column_name, p.type AS data_type, \
                 CASE WHEN p.\"notnull\" = 0 THEN 'YES' ELSE 'NO' END AS is_nullable \
                 FROM sqlite_master m \
                 JOIN pragma_table_info(m.name) p \
                 WHERE m.type = 'table' \
                 ORDER BY m.name, p.cid"
                    .to_string(),
        };

        let rows = sqlx::query(&schema_sql)
            .fetch_all(&pool)
            .await
            .map_err(|e| ConnectorError::Schema(e.to_string()))?;

        let mut tables: Vec<TableSchema> = Vec::new();

        for row in &rows {
            let table_name: String = row.try_get("table_name").unwrap_or_default();
            let col_name: String = row.try_get("column_name").unwrap_or_default();
            let data_type: String = row.try_get("data_type").unwrap_or_default();
            let is_nullable: String = row.try_get("is_nullable").unwrap_or_else(|_| "YES".to_string());

            if let Some(t) = tables.iter_mut().find(|t| t.name == table_name) {
                t.columns.push(ColumnSchema {
                    name: col_name,
                    data_type,
                    nullable: is_nullable == "YES",
                });
            } else {
                tables.push(TableSchema {
                    name: table_name,
                    columns: vec![ColumnSchema {
                        name: col_name,
                        data_type,
                        nullable: is_nullable == "YES",
                    }],
                });
            }
        }

        Ok(Schema { tables })
    }

    async fn execute_query(&self, query: AbstractQuery) -> Result<QueryResult, ConnectorError> {
        let (pool, _tunnel) = self.connect().await?;
        let (sql, args) = build_query(&query, &self.config.driver)?;

        let rows = sqlx::query_with(&sql, args)
            .fetch_all(&pool)
            .await
            .map_err(|e| ConnectorError::Query(e.to_string()))?;

        if rows.is_empty() {
            return Ok(QueryResult { columns: vec![], rows: vec![], total: Some(0) });
        }

        let columns: Vec<String> = rows[0].columns().iter().map(|c| c.name().to_string()).collect();
        let result_rows: Vec<Vec<serde_json::Value>> = rows.iter().map(map_any_row).collect();

        Ok(QueryResult {
            total: Some(result_rows.len() as u64),
            columns,
            rows: result_rows,
        })
    }
}

// ── SQL builder ───────────────────────────────────────────────────────────────

fn build_query(query: &AbstractQuery, driver: &DatabaseDriver) -> Result<(String, AnyArguments<'static>), ConnectorError> {
    let quote_ident = |name: &str| -> String {
        let s = sanitize_id(name);
        match driver {
            DatabaseDriver::Mysql | DatabaseDriver::Mariadb => format!("`{}`", s),
            _ => format!("\"{}\"", s),
        }
    };

    let cols = query
        .columns
        .as_ref()
        .map(|c| c.iter().map(|col| quote_ident(col)).collect::<Vec<_>>().join(", "))
        .unwrap_or_else(|| "*".to_string());

    let mut sql = format!("SELECT {} FROM {}", cols, quote_ident(&query.table));
    let mut args = AnyArguments::default();

    if !query.filters.is_empty() {
        let mut conditions = Vec::new();
        for f in &query.filters {
            let col = quote_ident(&f.column);
            let cond = match f.operator {
                FilterOperator::IsNull => format!("{} IS NULL", col),
                FilterOperator::IsNotNull => format!("{} IS NOT NULL", col),
                FilterOperator::In => {
                    if let Some(serde_json::Value::Array(vals)) = &f.value {
                        let placeholders = vec!["?"; vals.len()].join(", ");
                        for v in vals {
                            bind_json_value(&mut args, v)?;
                        }
                        format!("{} IN ({})", col, placeholders)
                    } else {
                        format!("{} IN (NULL)", col)
                    }
                }
                _ => {
                    let op = f.operator.to_sql_op();
                    if let Some(v) = &f.value {
                        bind_json_value(&mut args, v)?;
                    }
                    format!("{} {} ?", col, op)
                }
            };
            conditions.push(cond);
        }
        sql.push_str(&format!(" WHERE {}", conditions.join(" AND ")));
    }

    if !query.order_by.is_empty() {
        let orders: Vec<String> = query.order_by.iter().map(|o| {
            let dir = match o.direction { OrderDirection::Asc => "ASC", OrderDirection::Desc => "DESC" };
            format!("{} {}", quote_ident(&o.column), dir)
        }).collect();
        sql.push_str(&format!(" ORDER BY {}", orders.join(", ")));
    }

    if let Some(limit) = query.limit {
        sql.push_str(&format!(" LIMIT {}", limit));
    }
    if let Some(offset) = query.offset {
        sql.push_str(&format!(" OFFSET {}", offset));
    }

    Ok((sql, args))
}

fn bind_json_value(args: &mut AnyArguments<'static>, value: &serde_json::Value) -> Result<(), ConnectorError> {
    let err = |e: Box<dyn std::error::Error + Send + Sync>| ConnectorError::Query(e.to_string());
    match value {
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                args.add(i).map_err(err)?;
            } else if let Some(f) = n.as_f64() {
                args.add(f).map_err(err)?;
            }
        }
        serde_json::Value::Bool(b) => args.add(*b).map_err(err)?,
        serde_json::Value::String(s) => args.add(s.clone()).map_err(err)?,
        serde_json::Value::Null => args.add(Option::<String>::None).map_err(err)?,
        _ => args.add(value.to_string()).map_err(err)?,
    }
    Ok(())
}

fn sanitize_id(name: &str) -> String {
    name.chars().filter(|c| c.is_alphanumeric() || *c == '_').collect()
}

// ── Row mapper ────────────────────────────────────────────────────────────────

fn map_any_row(row: &AnyRow) -> Vec<serde_json::Value> {
    (0..row.columns().len())
        .map(|i| {
            let type_name = row.column(i).type_info().name().to_uppercase();
            match type_name.as_str() {
                // Postgres integers
                "INT2" | "INT4" | "INT8" | "OID" |
                // MySQL / MariaDB integers
                "BIGINT" | "INT" | "MEDIUMINT" | "SMALLINT" | "TINYINT" |
                // MariaDB extras
                "BIGINT UNSIGNED" | "INT UNSIGNED" | "MEDIUMINT UNSIGNED" |
                "SMALLINT UNSIGNED" | "TINYINT UNSIGNED" |
                // SQLite
                "INTEGER" => row
                    .try_get::<i64, _>(i)
                    .map(serde_json::Value::from)
                    .unwrap_or(serde_json::Value::Null),
                // Postgres floats
                "FLOAT4" | "FLOAT8" | "NUMERIC" |
                // MySQL floats
                "FLOAT" | "DOUBLE" | "DECIMAL" |
                // SQLite
                "REAL" => row
                    .try_get::<f64, _>(i)
                    .ok()
                    .and_then(|f| serde_json::Number::from_f64(f).map(serde_json::Value::Number))
                    .unwrap_or(serde_json::Value::Null),
                "BOOL" | "BOOLEAN" => row
                    .try_get::<bool, _>(i)
                    .map(serde_json::Value::from)
                    .unwrap_or(serde_json::Value::Null),
                _ => row
                    .try_get::<String, _>(i)
                    .map(serde_json::Value::from)
                    .unwrap_or(serde_json::Value::Null),
            }
        })
        .collect()
}
