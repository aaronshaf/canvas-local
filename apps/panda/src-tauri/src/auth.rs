use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthResult {
    pub user: User,
    pub domain: String,
    pub api_key: String,
}

#[derive(Debug, Default)]
pub struct AuthState {
    pub current_auth: Option<AuthResult>,
}

pub type AuthStateManager = Mutex<AuthState>;

#[tauri::command]
pub async fn authenticate(
    domain: String,
    email: String,
    api_key: String,
    state: State<'_, AuthStateManager>,
) -> Result<AuthResult, String> {
    // Validate domain
    let full_domain = if domain.starts_with("http") {
        domain.clone()
    } else {
        // Special case for local test domain
        if domain == "canvas-web.inseng.test" {
            format!("http://{}", domain)
        } else {
            format!("https://{}", domain)
        }
    };

    // Make a test API call to validate credentials
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/users/self", full_domain);
    
    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .send()
        .await
        .map_err(|e| format!("Failed to connect to Canvas: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_else(|_| "No error details available".to_string());
        return Err(format!("Authentication failed: {} - {}", status, error_body));
    }

    let user_data: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse user data: {}", e))?;

    let user = User {
        id: user_data["id"].to_string().trim_matches('"').to_string(),
        name: user_data["name"].as_str().unwrap_or(&email).to_string(),
        email: user_data["primary_email"]
            .as_str()
            .or(user_data["email"].as_str())
            .unwrap_or(&email)
            .to_string(),
    };

    let auth_result = AuthResult {
        user,
        domain: full_domain,
        api_key,
    };

    // Store in state
    let mut auth_state = state.lock().unwrap();
    auth_state.current_auth = Some(auth_result.clone());

    Ok(auth_result)
}

#[tauri::command]
pub async fn store_auth_token(
    domain: String,
    _api_key: String,
) -> Result<(), String> {
    // In a real implementation, you would use the OS keychain
    // For now, we'll just acknowledge the request
    println!("Storing auth token for domain: {}", domain);
    // TODO: Implement secure storage using keyring-rs or similar
    Ok(())
}

#[tauri::command]
pub async fn clear_auth_token(
    state: State<'_, AuthStateManager>,
) -> Result<(), String> {
    let mut auth_state = state.lock().unwrap();
    auth_state.current_auth = None;
    // TODO: Clear from secure storage
    Ok(())
}

#[tauri::command]
pub async fn get_stored_auth(
    state: State<'_, AuthStateManager>,
) -> Result<Option<AuthResult>, String> {
    let auth_state = state.lock().unwrap();
    Ok(auth_state.current_auth.clone())
}