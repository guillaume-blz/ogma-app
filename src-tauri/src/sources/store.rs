use sqlx::{SqlitePool, Row};
use uuid::Uuid;
use chrono::Utc;
use thiserror::Error;
use crate::sources::models::{Source, SourceType};

#[derive(Debug, Error)]
pub enum StoreError {
    #[error(transparent)]
    Sql(#[from] sqlx::Error),
    #[error("decode error: {0}")]
    Decode(String),
}

fn row_to_source(r: &sqlx::sqlite::SqliteRow) -> Result<Source, StoreError> {
    let source_type_str: String = r.try_get("source_type")?;
    let config_str: String = r.try_get("config")?;
    Ok(Source {
        id: r.try_get("id")?,
        name: r.try_get("name")?,
        source_type: source_type_str.parse::<SourceType>().map_err(StoreError::Decode)?,
        config: serde_json::from_str(&config_str).map_err(|e| StoreError::Decode(e.to_string()))?,
        created_at: r.try_get("created_at")?,
        updated_at: r.try_get("updated_at")?,
    })
}

pub async fn list(pool: &SqlitePool) -> Result<Vec<Source>, StoreError> {
    let rows = sqlx::query(
        "SELECT id, name, source_type, config, created_at, updated_at FROM sources ORDER BY created_at DESC",
    )
    .fetch_all(pool)
    .await?;

    rows.iter().map(row_to_source).collect()
}

pub async fn get(pool: &SqlitePool, id: &str) -> Result<Source, StoreError> {
    let row = sqlx::query(
        "SELECT id, name, source_type, config, created_at, updated_at FROM sources WHERE id = ?",
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    row_to_source(&row)
}

pub async fn create(
    pool: &SqlitePool,
    name: &str,
    source_type: SourceType,
    config: serde_json::Value,
) -> Result<Source, StoreError> {
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let source_type_str = source_type.to_string();
    let config_str = serde_json::to_string(&config).map_err(|e| StoreError::Decode(e.to_string()))?;

    sqlx::query(
        "INSERT INTO sources (id, name, source_type, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(name)
    .bind(&source_type_str)
    .bind(&config_str)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;

    get(pool, &id).await
}

pub async fn update(
    pool: &SqlitePool,
    id: &str,
    name: &str,
    config: serde_json::Value,
) -> Result<Source, StoreError> {
    let now = Utc::now().to_rfc3339();
    let config_str = serde_json::to_string(&config).map_err(|e| StoreError::Decode(e.to_string()))?;

    sqlx::query("UPDATE sources SET name = ?, config = ?, updated_at = ? WHERE id = ?")
        .bind(name)
        .bind(&config_str)
        .bind(&now)
        .bind(id)
        .execute(pool)
        .await?;

    get(pool, id).await
}

pub async fn delete(pool: &SqlitePool, id: &str) -> Result<(), StoreError> {
    sqlx::query("DELETE FROM sources WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}
