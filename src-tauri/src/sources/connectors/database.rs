use async_trait::async_trait;
use sqlx::postgres::{PgPoolOptions, PgArguments, PgRow};
use sqlx::{Arguments, Row, Column};
use sqlx::TypeInfo;

use crate::sources::models::DatabaseConfig;
use crate::sources::query::{
    AbstractQuery, FilterOperator, OrderDirection, QueryResult, Schema, TableSchema, ColumnSchema,
};
use super::ConnectorError;

pub struct DatabaseConnector {
    config: DatabaseConfig,
}

impl DatabaseConnector {
    pub fn new(config: DatabaseConfig) -> Self {
        Self { config }
    }

    async fn pool(&self) -> Result<sqlx::PgPool, ConnectorError> {
        PgPoolOptions::new()
            .max_connections(3)
            .connect(&self.config.connection_url())
            .await
            .map_err(|e| ConnectorError::Connection(e.to_string()))
    }
}

#[async_trait]
impl super::Connector for DatabaseConnector {
    async fn test_connection(&self) -> Result<(), ConnectorError> {
        let pool = self.pool().await?;
        sqlx::query("SELECT 1")
            .execute(&pool)
            .await
            .map(|_| ())
            .map_err(|e| ConnectorError::Connection(e.to_string()))
    }

    async fn fetch_schema(&self) -> Result<Schema, ConnectorError> {
        let pool = self.pool().await?;

        let rows = sqlx::query(
            "SELECT c.table_name, c.column_name, c.data_type, c.is_nullable
             FROM information_schema.columns c
             JOIN information_schema.tables t
               ON c.table_name = t.table_name AND c.table_schema = t.table_schema
             WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
             ORDER BY c.table_name, c.ordinal_position",
        )
        .fetch_all(&pool)
        .await
        .map_err(|e| ConnectorError::Schema(e.to_string()))?;

        let mut tables: Vec<TableSchema> = Vec::new();

        for row in &rows {
            let table_name: &str = row.try_get("table_name").unwrap_or_default();
            let col_name: &str = row.try_get("column_name").unwrap_or_default();
            let data_type: &str = row.try_get("data_type").unwrap_or_default();
            let is_nullable: &str = row.try_get("is_nullable").unwrap_or("YES");

            if let Some(t) = tables.iter_mut().find(|t| t.name == table_name) {
                t.columns.push(ColumnSchema {
                    name: col_name.to_string(),
                    data_type: data_type.to_string(),
                    nullable: is_nullable == "YES",
                });
            } else {
                tables.push(TableSchema {
                    name: table_name.to_string(),
                    columns: vec![ColumnSchema {
                        name: col_name.to_string(),
                        data_type: data_type.to_string(),
                        nullable: is_nullable == "YES",
                    }],
                });
            }
        }

        Ok(Schema { tables })
    }

    async fn execute_query(&self, query: AbstractQuery) -> Result<QueryResult, ConnectorError> {
        let pool = self.pool().await?;
        let (sql, args) = build_pg_query(&query)?;

        let rows = sqlx::query_with(&sql, args)
            .fetch_all(&pool)
            .await
            .map_err(|e| ConnectorError::Query(e.to_string()))?;

        if rows.is_empty() {
            return Ok(QueryResult { columns: vec![], rows: vec![], total: Some(0) });
        }

        let columns: Vec<String> = rows[0].columns().iter().map(|c| c.name().to_string()).collect();
        let result_rows: Vec<Vec<serde_json::Value>> = rows.iter().map(map_pg_row).collect();

        Ok(QueryResult {
            total: Some(result_rows.len() as u64),
            columns,
            rows: result_rows,
        })
    }
}

// ── SQL builder ───────────────────────────────────────────────────────────────

fn build_pg_query(query: &AbstractQuery) -> Result<(String, PgArguments), ConnectorError> {
    let cols = query
        .columns
        .as_ref()
        .map(|c| c.iter().map(|col| format!("\"{}\"", sanitize_id(col))).collect::<Vec<_>>().join(", "))
        .unwrap_or_else(|| "*".to_string());

    let mut sql = format!("SELECT {} FROM \"{}\"", cols, sanitize_id(&query.table));
    let mut args = PgArguments::default();
    let mut param_idx = 1usize;

    if !query.filters.is_empty() {
        let mut conditions = Vec::new();
        for f in &query.filters {
            let col = format!("\"{}\"", sanitize_id(&f.column));
            let cond = match f.operator {
                FilterOperator::IsNull => format!("{} IS NULL", col),
                FilterOperator::IsNotNull => format!("{} IS NOT NULL", col),
                FilterOperator::In => {
                    if let Some(serde_json::Value::Array(vals)) = &f.value {
                        let placeholders: Vec<String> = (0..vals.len())
                            .map(|_| { let p = format!("${}", param_idx); param_idx += 1; p })
                            .collect();
                        for v in vals {
                            bind_json_value(&mut args, v)?;
                        }
                        format!("{} IN ({})", col, placeholders.join(", "))
                    } else {
                        format!("{} IN (NULL)", col)
                    }
                }
                _ => {
                    let op = f.operator.to_sql_op();
                    let placeholder = format!("${}", param_idx);
                    param_idx += 1;
                    if let Some(v) = &f.value {
                        bind_json_value(&mut args, v)?;
                    }
                    format!("{} {} {}", col, op, placeholder)
                }
            };
            conditions.push(cond);
        }
        sql.push_str(&format!(" WHERE {}", conditions.join(" AND ")));
    }

    if !query.order_by.is_empty() {
        let orders: Vec<String> = query.order_by.iter().map(|o| {
            let dir = match o.direction { OrderDirection::Asc => "ASC", OrderDirection::Desc => "DESC" };
            format!("\"{}\" {}", sanitize_id(&o.column), dir)
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

fn bind_json_value(args: &mut PgArguments, value: &serde_json::Value) -> Result<(), ConnectorError> {
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

fn map_pg_row(row: &PgRow) -> Vec<serde_json::Value> {
    (0..row.columns().len())
        .map(|i| {
            let type_name = row.column(i).type_info().name();
            match type_name {
                "INT2" | "INT4" | "INT8" | "OID" => row
                    .try_get::<i64, _>(i)
                    .map(serde_json::Value::from)
                    .unwrap_or(serde_json::Value::Null),
                "FLOAT4" | "FLOAT8" | "NUMERIC" => row
                    .try_get::<f64, _>(i)
                    .ok()
                    .and_then(|f| serde_json::Number::from_f64(f).map(serde_json::Value::Number))
                    .unwrap_or(serde_json::Value::Null),
                "BOOL" => row
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
