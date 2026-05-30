mod db;
mod ssh;
mod state;
mod sources;

use tauri::Manager;

use sources::commands::*;
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, apply_liquid_glass, NSGlassEffectViewStyle};


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

            let window = app.get_webview_window("main").expect("failed to get main window");

            // #[cfg(target_os = "macos")]
            // {
            //     apply_liquid_glass(&window, NSGlassEffectViewStyle::Clear, None, Some(26.0))
            //         .expect(
            //             "Unsupported platform! 'apply_liquid_glass' is only supported on macOS 26+",
            //         );
            // }


            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};
                apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, Some(NSVisualEffectState::Active), None)
                    .expect("failed to apply vibrancy");
            }

            #[cfg(target_os = "windows")]
            {
                use window_vibrancy::apply_acrylic;
                let _ = apply_acrylic(&window, Some((0, 0, 0, 50)));
            }

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
            source_database_drivers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
