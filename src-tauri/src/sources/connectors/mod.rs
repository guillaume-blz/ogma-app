pub mod database;

use async_trait::async_trait;
use thiserror::Error;
use crate::sources::models::{Source, SourceType, DatabaseConfig};
use crate::sources::query::{AbstractQuery, QueryResult, Schema};

#[derive(Debug, Error)]
pub enum ConnectorError {
    #[error("Connection failed: {0}")]
    Connection(String),
    #[error("Query failed: {0}")]
    Query(String),
    #[error("Schema error: {0}")]
    Schema(String),
    #[error("Invalid config: {0}")]
    Config(String),
}

#[async_trait]
pub trait Connector: Send + Sync {
    async fn test_connection(&self) -> Result<(), ConnectorError>;
    async fn fetch_schema(&self) -> Result<Schema, ConnectorError>;
    async fn execute_query(&self, query: AbstractQuery) -> Result<QueryResult, ConnectorError>;
}

pub fn make_connector(source: &Source) -> Result<Box<dyn Connector>, ConnectorError> {
    match source.source_type {
        SourceType::Database => {
            let config: DatabaseConfig = serde_json::from_value(source.config.clone())
                .map_err(|e| ConnectorError::Config(e.to_string()))?;
            Ok(Box::new(database::DatabaseConnector::new(config)))
        }
        _ => Err(ConnectorError::Config(format!(
            "connector not implemented for type: {}",
            source.source_type
        ))),
    }
}
