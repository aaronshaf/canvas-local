# Panda Architecture

## Overview

Panda is a desktop application for Canvas LMS built with Tauri, following a clear separation of concerns between the Rust backend and TypeScript frontend.

## Core Architectural Principles

### 1. TypeScript-First Business Logic
- **All business logic resides in TypeScript** (primarily in `packages/shared-lib`)
- **Rust serves exclusively as a secure proxy layer** for:
  - API request proxying with authentication
  - OS-level integrations (keychain, file system)
  - SQLite database access
- This approach ensures:
  - Business logic remains portable and testable
  - Code can be shared between different frontends
  - Developers can work primarily in TypeScript
  - Security-sensitive operations are handled by Rust

### 2. API Request Flow
```
Frontend (TypeScript) → Tauri Command → Rust Proxy → Canvas API
                                             ↓
Frontend (TypeScript) ← Tauri Response ← Rust Proxy
```

- GraphQL and REST requests originate from the frontend
- Rust intercepts these requests to:
  - Add authentication headers from secure storage
  - Handle domain-specific logic (HTTP vs HTTPS)
  - Provide a secure bridge to external APIs
- Business logic for data transformation stays in TypeScript

### 3. Monorepo Structure

```
panda/
├── apps/
│   └── panda/                 # Main Tauri application
│       ├── src/               # React frontend
│       └── src-tauri/         # Rust backend (proxy only)
├── packages/
│   ├── shared-lib/            # Business logic, API clients, schemas
│   └── ui-components/         # Reusable UI components
└── docs/                      # Documentation
```

### 4. Data Flow Architecture

1. **Authentication Flow**
   - User credentials entered in React UI
   - Passed to Rust via Tauri commands
   - Rust validates with Canvas API
   - Tokens stored securely (eventually in OS keychain)
   - Auth state maintained in both Rust and React

2. **API Request Flow**
   - React components use services from `shared-lib`
   - Services make GraphQL/REST calls via Tauri commands
   - Rust proxy adds authentication and forwards request
   - Response returned to TypeScript for processing
   - Data transformed by TypeScript business logic

3. **Offline Data Flow** (Future)
   - TypeScript services check cache first
   - Rust provides SQLite access via Tauri commands
   - Background sync coordinated by TypeScript
   - Rust handles only the database I/O

## Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tooling
- **Instructure UI** - Canvas design system components
- **Effect** - Functional programming utilities
- **Effect Schema** - Runtime type validation

### Backend (Rust)
- **Tauri** - Desktop application framework
- **reqwest** - HTTP client for API proxying
- **serde** - Serialization/deserialization
- **SQLite** - Local database (future)
- **keyring** - OS keychain integration (future)

### Shared Libraries
- **shared-lib** - Contains:
  - GraphQL queries and mutations
  - REST API client interfaces
  - Data schemas (Effect Schema)
  - Business logic and data transformations
  - Service layer abstractions

## Security Architecture

1. **API Token Management**
   - Tokens never stored in frontend code
   - Rust manages secure storage (OS keychain planned)
   - Tokens added to requests only in Rust layer

2. **Network Security**
   - All external requests go through Rust proxy
   - Domain validation in Rust
   - Special handling for test domains (HTTP allowed)

3. **Process Isolation**
   - Frontend runs in isolated web context
   - Backend has system-level access
   - Communication only through defined Tauri commands

## Future Enhancements

1. **Offline Support**
   - SQLite database for local caching
   - Sync engine in TypeScript
   - Rust provides only database access layer

2. **Plugin System**
   - Plugins written in TypeScript
   - Sandboxed execution environment
   - Rust provides secure API access

3. **Multi-Instance Support**
   - Multiple Canvas instances
   - Account switching in UI
   - Rust manages separate auth states

## Development Guidelines

1. **When to use Rust**
   - API request proxying
   - OS-level integrations
   - Security-sensitive operations
   - Performance-critical I/O

2. **When to use TypeScript**
   - All business logic
   - Data transformations
   - UI state management
   - API response handling
   - Cache management logic

3. **Testing Strategy**
   - Business logic tests in TypeScript
   - Integration tests for Tauri commands
   - E2E tests for full workflows
   - Security tests for auth flows

This architecture ensures a clean separation of concerns, maintainable codebase, and secure handling of sensitive data while keeping the development experience primarily in TypeScript.