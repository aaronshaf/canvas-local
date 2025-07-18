# Tauri Documentation for LLMs

This document provides a summary of the Tauri framework, intended to be used as a reference for Large Language Models (LLMs) working on this project. The information is synthesized from the official Tauri documentation.

Source: https://tauri.app/llms.txt

## What is Tauri?

Tauri is a framework for building cross-platform desktop and mobile applications using web technologies for the frontend. It allows developers to create small, fast, and secure applications by leveraging a Rust backend and a webview-based frontend.

Key features include:

*   **Cross-Platform:** Build for all major desktop and mobile operating systems from a single codebase.
*   **Performance:** Applications are compiled to native binaries, resulting in small bundle sizes and efficient resource usage.
*   **Security:** Tauri is designed with security in mind, with features like Content Security Policy (CSP), and a permissions system to control access to system resources.
*   **Frontend Agnostic:** Use any frontend framework that compiles to HTML, CSS, and JavaScript, such as React, Svelte, or Vue.

## Core Concepts

### Architecture

Tauri's architecture consists of two main parts:

1.  **The Core Process:** This is the heart of a Tauri application, written in Rust. It manages the application's lifecycle, windows, and provides access to native system APIs.
2.  **The Webview:** This is where the user interface is rendered. Tauri uses the operating system's native webview engine (e.g., WKWebView on macOS, WebView2 on Windows) to display the frontend.

### Inter-Process Communication (IPC)

Communication between the Rust backend and the JavaScript frontend is a core feature of Tauri. This is achieved through an Inter-Process Communication (IPC) bridge.

*   **Calling Rust from the Frontend:** The frontend can invoke Rust functions by sending asynchronous messages. These functions, called "Commands," must be explicitly exposed by the Rust backend.
*   **Calling the Frontend from Rust:** The Rust backend can emit events that the frontend can listen to, allowing for real-time communication and updates.

### Process Model

Tauri applications have a multi-process architecture. The main process, written in Rust, is responsible for managing the application's lifecycle and all the webviews. Each webview runs in its own process, which isolates the UI from the backend and from other webviews.

## Security

Security is a primary focus of Tauri. Key security features include:

*   **Capabilities:** A system for granularly enabling or disabling access to specific APIs at runtime. This allows developers to restrict what the application can do, reducing the potential attack surface.
*   **Content Security Policy (CSP):** Tauri enforces a strict CSP to prevent cross-site scripting (XSS) and other injection attacks.
*   **Permissions:** Similar to capabilities, but for plugins. This allows for fine-grained control over the features a plugin can access.

## Development

### Configuration

Tauri applications are configured using a `tauri.conf.json` file. This file allows you to customize various aspects of the application, including:

*   Application metadata (name, version, identifier)
*   Window settings (size, title, decorations)
*   Security settings (capabilities, permissions)
*   Plugin configurations

### Debugging

Tauri provides several methods for debugging applications:

*   **Rust Debugging:** Use standard Rust debugging tools like `gdb` or `lldb`, or IDE integrations for VS Code and JetBrains IDEs.
*   **Frontend Debugging:** The webview can be inspected using the browser's developer tools.

### State Management

Tauri provides a built-in state management solution that allows you to share state between the Rust backend and the frontend, as well as between different windows.

## Working with Tauri

### Commands

Commands are Rust functions that can be called from the frontend. To create a command, define a function and annotate it with `#[tauri::command]`.

**Rust:**
```rust
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}!", name)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

**JavaScript:**
```javascript
import { invoke } from '@tauri-apps/api/tauri';

// returns "Hello, World!"
const response = await invoke('greet', { name: 'World' });
```

### Events

Events allow the Rust backend to send messages to the frontend.

**Rust:**
```rust
use tauri::Manager;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let app_handle = app.handle();
      std::thread::spawn(move || {
        loop {
          app_handle.emit_all("my-event", "Hello from Rust!").unwrap();
          std::thread::sleep(std::time::Duration::from_secs(1));
        }
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

**JavaScript:**
```javascript
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen('my-event', (event) => {
  console.log(event.payload);
});
```

### Plugins

Tauri has a plugin system to extend its functionality. To use a plugin, add it to your `Cargo.toml` and register it in your `main.rs` file.

**`Cargo.toml`:**
```toml
[dependencies]
tauri-plugin-fs-extra = "0.1"
```

**`main.rs`:**
```rust
fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs_extra::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

## Distribution

Tauri simplifies the process of distributing applications by providing a built-in bundler. It can generate installers and packages for all major platforms, including:

*   **Windows:** MSI, NSIS
*   **macOS:** .app, .dmg
*   **Linux:** .deb, AppImage, .rpm
*   **Mobile:** Android (APK, AAB), iOS (.app)

Tauri also supports code signing for all platforms, which is essential for a secure and professional distribution.
