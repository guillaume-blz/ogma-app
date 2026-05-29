mod db;
mod ssh;
mod state;
mod sources;

use tauri::Manager;

use sources::commands::*;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let db = tauri::async_runtime::block_on(db::init(app.handle()))
                .expect("failed to initialize database");
            app.manage(state::AppState { db });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            source_list,
            source_create,
            source_update,
            source_delete,
            source_test,
            source_schema,
            source_query,
            source_test_ssh,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
