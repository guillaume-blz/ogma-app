use tauri::State;
use crate::state::AppState;
use crate::sources::{models::{SourceType, SshTunnelConfig}, query::AbstractQuery, store, connectors::make_connector};

#[tauri::command]
pub async fn source_list(state: State<'_, AppState>) -> Result<Vec<serde_json::Value>, String> {
    let sources = store::list(&state.db).await.map_err(|e| e.to_string())?;
    let json = sources.iter()
        .map(|s| serde_json::to_value(s).map_err(|e| e.to_string()))
        .collect::<Result<Vec<_>, _>>()?;
    Ok(json)
}

#[tauri::command]
pub async fn source_create(
    state: State<'_, AppState>,
    name: String,
    source_type: String,
    config: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let t: SourceType = source_type.parse().map_err(|e: String| e)?;
    let source = store::create(&state.db, &name, t, config).await.map_err(|e| e.to_string())?;
    serde_json::to_value(&source).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn source_update(
    state: State<'_, AppState>,
    id: String,
    name: String,
    config: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let source = store::update(&state.db, &id, &name, config).await.map_err(|e| e.to_string())?;
    serde_json::to_value(&source).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn source_delete(state: State<'_, AppState>, id: String) -> Result<(), String> {
    store::delete(&state.db, &id).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn source_test(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let source = store::get(&state.db, &id).await.map_err(|e| e.to_string())?;
    let connector = make_connector(&source).map_err(|e| e.to_string())?;
    connector.test_connection().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn source_schema(
    state: State<'_, AppState>,
    id: String,
) -> Result<serde_json::Value, String> {
    let source = store::get(&state.db, &id).await.map_err(|e| e.to_string())?;
    let connector = make_connector(&source).map_err(|e| e.to_string())?;
    let schema = connector.fetch_schema().await.map_err(|e| e.to_string())?;
    serde_json::to_value(&schema).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn source_query(
    state: State<'_, AppState>,
    id: String,
    query: AbstractQuery,
) -> Result<serde_json::Value, String> {
    let source = store::get(&state.db, &id).await.map_err(|e| e.to_string())?;
    let connector = make_connector(&source).map_err(|e| e.to_string())?;
    let result = connector.execute_query(query).await.map_err(|e| e.to_string())?;
    serde_json::to_value(&result).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn source_test_ssh(config: SshTunnelConfig) -> Result<String, String> {
    crate::ssh::test_ssh_tunnel(&config).await
}
