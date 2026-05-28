use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SourceType {
    Database,
    Files,
    Api,
    Saas,
}

impl std::fmt::Display for SourceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            SourceType::Database => "database",
            SourceType::Files => "files",
            SourceType::Api => "api",
            SourceType::Saas => "saas",
        };
        write!(f, "{}", s)
    }
}

impl std::str::FromStr for SourceType {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "database" => Ok(SourceType::Database),
            "files" => Ok(SourceType::Files),
            "api" => Ok(SourceType::Api),
            "saas" => Ok(SourceType::Saas),
            _ => Err(format!("unknown source type: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Source {
    pub id: String,
    pub name: String,
    pub source_type: SourceType,
    pub config: serde_json::Value,
    pub created_at: String,
    pub updated_at: String,
}

// ── Database-specific config ─────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DatabaseDriver {
    Postgres,
    Mysql,
    Sqlite,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub driver: DatabaseDriver,
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String, // TODO: move to OS keychain
}

impl DatabaseConfig {
    pub fn connection_url(&self) -> String {
        match self.driver {
            DatabaseDriver::Postgres => format!(
                "postgresql://{}:{}@{}:{}/{}",
                self.username, self.password, self.host, self.port, self.database
            ),
            DatabaseDriver::Mysql => format!(
                "mysql://{}:{}@{}:{}/{}",
                self.username, self.password, self.host, self.port, self.database
            ),
            DatabaseDriver::Sqlite => format!("sqlite://{}", self.host),
        }
    }
}
