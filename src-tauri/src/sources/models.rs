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
    Mariadb,
    Sqlite,
}

#[derive(Debug, Serialize)]
pub struct DatabaseDriverMeta {
    pub value: &'static str,
    pub label: &'static str,
    pub default_port: u16,
}

impl DatabaseDriver {
    pub fn all() -> Vec<DatabaseDriverMeta> {
        vec![
            DatabaseDriverMeta { value: "postgres", label: "PostgreSQL", default_port: 5432 },
            DatabaseDriverMeta { value: "mysql",    label: "MySQL",      default_port: 3306 },
            DatabaseDriverMeta { value: "mariadb",  label: "MariaDB",    default_port: 3306 },
            DatabaseDriverMeta { value: "sqlite",   label: "SQLite",     default_port: 0    },
        ]
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SshAuthType {
    Password,
    Key,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SshTunnelConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_type: SshAuthType,
    pub password: Option<String>,
    pub key_path: Option<String>,
    pub passphrase: Option<String>,
    pub known_host_key: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub driver: DatabaseDriver,
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String, // TODO: move to OS keychain
    #[serde(default)]
    pub ssh_tunnel: Option<SshTunnelConfig>,
}

impl DatabaseConfig {
    pub fn connection_url(&self) -> String {
        self.connection_url_for(&self.host, self.port)
    }

    pub fn connection_url_for(&self, host: &str, port: u16) -> String {
        match self.driver {
            DatabaseDriver::Postgres => format!(
                "postgresql://{}:{}@{}:{}/{}",
                self.username, self.password, host, port, self.database
            ),
            DatabaseDriver::Mysql | DatabaseDriver::Mariadb => format!(
                "mysql://{}:{}@{}:{}/{}",
                self.username, self.password, host, port, self.database
            ),
            DatabaseDriver::Sqlite => format!("sqlite://{}", self.host),
        }
    }
}
