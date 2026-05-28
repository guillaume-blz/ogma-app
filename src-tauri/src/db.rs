use sqlx::SqlitePool;
use tauri::Manager;

pub async fn init(handle: &tauri::AppHandle) -> Result<SqlitePool, sqlx::Error> {
    let app_dir = handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    std::fs::create_dir_all(&app_dir).ok();

    let db_url = format!(
        "sqlite://{}?mode=rwc",
        app_dir.join("ogma.db").to_string_lossy()
    );

    let pool = SqlitePool::connect(&db_url).await?;
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}
