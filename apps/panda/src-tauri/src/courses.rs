use serde::{Deserialize, Serialize};
use tauri::State;
use crate::auth::AuthStateManager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Course {
    pub id: String,
    pub name: String,
    pub course_code: String,
    pub enrollment_term_id: Option<String>,
    pub workflow_state: String,
    pub enrollment_type: String,
    pub color: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CourseWithStats {
    pub id: String,
    pub name: String,
    pub course_code: String,
    pub term: String,
    pub enrollment_type: String,
    pub color: String,
    pub assignments_due: u32,
    pub discussions: u32,
    pub announcements: u32,
    pub progress: u32,
}

#[tauri::command]
pub async fn get_courses(
    state: State<'_, AuthStateManager>,
) -> Result<Vec<CourseWithStats>, String> {
    // Get auth state
    let auth_state = state.lock().unwrap();
    let auth = auth_state.current_auth.as_ref()
        .ok_or("Not authenticated")?;
    
    let domain = auth.domain.clone();
    let api_key = auth.api_key.clone();
    
    // Drop the lock before making async call
    drop(auth_state);
    
    // Fetch courses using the stored auth
    fetch_courses(domain, api_key).await
}

#[tauri::command]
pub async fn fetch_courses(
    domain: String,
    api_key: String,
) -> Result<Vec<CourseWithStats>, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/v1/courses", domain);
    
    // Fetch courses with enrollments and other data
    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .query(&[
            ("enrollment_state", "active"),
            ("include[]", "total_scores"),
            ("include[]", "current_grading_period_scores"),
            ("include[]", "course_progress"),
        ])
        .send()
        .await
        .map_err(|e| format!("Failed to fetch courses: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_else(|_| "No error details available".to_string());
        return Err(format!("Failed to fetch courses: {} - {}", status, error_body));
    }

    let courses: Vec<serde_json::Value> = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse courses: {}", e))?;

    // Transform to our CourseWithStats format
    let course_stats: Vec<CourseWithStats> = courses.into_iter().map(|course| {
        // Generate a color if not provided
        let colors = vec!["#1A73E8", "#0F9D58", "#EA4335", "#F9AB00", "#9C27B0", "#00BCD4"];
        let color_index = course["id"].as_u64().unwrap_or(0) as usize % colors.len();
        
        CourseWithStats {
            id: course["id"].to_string().trim_matches('"').to_string(),
            name: course["name"].as_str().unwrap_or("Unnamed Course").to_string(),
            course_code: course["course_code"].as_str().unwrap_or("").to_string(),
            term: course["enrollment_term_id"].as_str().unwrap_or("Current Term").to_string(),
            enrollment_type: course["enrollments"][0]["type"].as_str()
                .unwrap_or("student")
                .to_lowercase()
                .replace("enrollment", ""),
            color: course["course_color"].as_str()
                .map(|c| c.to_string())
                .unwrap_or_else(|| colors[color_index].to_string()),
            assignments_due: 0, // Will be fetched separately
            discussions: 0, // Will be fetched separately
            announcements: 0, // Will be fetched separately
            progress: course["course_progress"]["completed_at"].as_str()
                .map(|_| 100)
                .unwrap_or_else(|| {
                    let completed = course["course_progress"]["completed_count"].as_u64().unwrap_or(0);
                    let total = course["course_progress"]["requirement_count"].as_u64().unwrap_or(1);
                    ((completed as f64 / total as f64) * 100.0) as u32
                }),
        }
    }).collect();

    Ok(course_stats)
}