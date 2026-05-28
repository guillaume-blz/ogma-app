use serde::{Deserialize, Serialize};

/// Abstract query model — connector-agnostic, each connector translates it to its own dialect.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AbstractQuery {
    pub table: String,
    pub columns: Option<Vec<String>>,
    #[serde(default)]
    pub filters: Vec<Filter>,
    #[serde(default)]
    pub order_by: Vec<OrderBy>,
    pub limit: Option<u64>,
    pub offset: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Filter {
    pub column: String,
    pub operator: FilterOperator,
    pub value: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FilterOperator {
    Eq,
    Ne,
    Gt,
    Gte,
    Lt,
    Lte,
    Like,
    In,
    IsNull,
    IsNotNull,
}

impl FilterOperator {
    pub fn to_sql_op(&self) -> &'static str {
        match self {
            FilterOperator::Eq => "=",
            FilterOperator::Ne => "!=",
            FilterOperator::Gt => ">",
            FilterOperator::Gte => ">=",
            FilterOperator::Lt => "<",
            FilterOperator::Lte => "<=",
            FilterOperator::Like => "LIKE",
            _ => "=",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderBy {
    pub column: String,
    pub direction: OrderDirection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderDirection {
    Asc,
    Desc,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub columns: Vec<String>,
    pub rows: Vec<Vec<serde_json::Value>>,
    pub total: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Schema {
    pub tables: Vec<TableSchema>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TableSchema {
    pub name: String,
    pub columns: Vec<ColumnSchema>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ColumnSchema {
    pub name: String,
    pub data_type: String,
    pub nullable: bool,
}
