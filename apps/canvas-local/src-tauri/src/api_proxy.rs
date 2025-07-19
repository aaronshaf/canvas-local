use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::State;
use crate::auth::AuthStateManager;

#[derive(Debug, Serialize, Deserialize)]
pub struct GraphQLRequest {
    pub query: String,
    pub variables: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RestRequest {
    pub method: String,
    pub path: String,
    pub params: Option<Value>,
    pub body: Option<Value>,
}

#[tauri::command]
pub async fn graphql_request(
    request: GraphQLRequest,
    state: State<'_, AuthStateManager>,
) -> Result<Value, String> {
    // Get auth state and clone values before dropping lock
    let (domain, api_key) = {
        let auth_state = state.lock().unwrap();
        let auth = auth_state.current_auth.as_ref()
            .ok_or("Not authenticated")?;
        (auth.domain.clone(), auth.api_key.clone())
    };
    
    // Make GraphQL request
    let client = reqwest::Client::new();
    let url = format!("{}/api/graphql", domain);
    
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("GraphQL request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_else(|_| "No error details available".to_string());
        return Err(format!("GraphQL request failed: {} - {}", status, error_body));
    }

    let result: Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse GraphQL response: {}", e))?;

    Ok(result)
}

#[tauri::command]
pub async fn rest_request(
    request: RestRequest,
    state: State<'_, AuthStateManager>,
) -> Result<Value, String> {
    // Get auth state and clone values before dropping lock
    let (domain, api_key) = {
        let auth_state = state.lock().unwrap();
        let auth = auth_state.current_auth.as_ref()
            .ok_or("Not authenticated")?;
        (auth.domain.clone(), auth.api_key.clone())
    };
    
    // Build URL
    let url = format!("{}{}", domain, request.path);
    
    // Create request builder based on method
    let client = reqwest::Client::new();
    let mut req = match request.method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        _ => return Err(format!("Unsupported HTTP method: {}", request.method)),
    };
    
    // Add auth header
    req = req.header("Authorization", format!("Bearer {}", api_key));
    
    // Add query params if provided
    if let Some(params) = request.params {
        if let Some(obj) = params.as_object() {
            let query_params: Vec<(String, String)> = obj.iter()
                .map(|(k, v)| (k.clone(), v.to_string().trim_matches('"').to_string()))
                .collect();
            req = req.query(&query_params);
        }
    }
    
    // Add body if provided
    if let Some(body) = request.body {
        req = req.header("Content-Type", "application/json").json(&body);
    }
    
    // Send request
    let response = req
        .send()
        .await
        .map_err(|e| format!("REST request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_else(|_| "No error details available".to_string());
        return Err(format!("REST request failed: {} - {}", status, error_body));
    }

    let result: Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse REST response: {}", e))?;

    Ok(result)
}