mod auth;
mod api_proxy;

use auth::AuthState;
use std::sync::Mutex;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AuthState::default()))
        .invoke_handler(tauri::generate_handler![
            greet,
            auth::authenticate,
            auth::store_auth_token,
            auth::clear_auth_token,
            auth::get_stored_auth,
            api_proxy::graphql_request,
            api_proxy::rest_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
