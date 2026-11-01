use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

/// Schema from docs/TRENDS.md §2. The migration key has to match the connection
/// string the frontend loads, and that string is absolute so the database lands
/// in `app_data_dir()` rather than the plugin's default `app_config_dir()`.
fn trends_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create trends tables",
        sql: r#"
CREATE TABLE repos (
  id            INTEGER PRIMARY KEY,
  full_name     TEXT NOT NULL,
  language      TEXT,
  stars         INTEGER NOT NULL,
  forks         INTEGER NOT NULL,
  open_issues   INTEGER NOT NULL,
  source        TEXT NOT NULL,
  first_seen    TEXT NOT NULL,
  last_seen     TEXT NOT NULL,
  missing_since TEXT
);

CREATE TABLE snapshots (
  repo_id     INTEGER NOT NULL,
  day         TEXT NOT NULL,
  stars       INTEGER NOT NULL,
  forks       INTEGER NOT NULL,
  open_issues INTEGER NOT NULL,
  PRIMARY KEY (repo_id, day)
);

CREATE INDEX idx_snapshots_day ON snapshots(day);

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO meta (key, value) VALUES ('schema_version', '1');
"#,
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let db_url = format!("sqlite:{}", data_dir.join("dev-radar.db").display());

            app.handle().plugin(
                tauri_plugin_sql::Builder::default()
                    .add_migrations(&db_url, trends_migrations())
                    .build(),
            )?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
