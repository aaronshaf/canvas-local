# Technical Plan: Panda Tauri App

This document outlines the technical plan for building a local desktop application for Canvas using Tauri. It details the project structure, technology stack, development workflow, and CI/CD strategy based on the requirements provided.

## 1. Overview

The goal is to create a performant, cross-platform desktop application that interacts with the Canvas LMS APIs. The application will provide a native-like user experience using web technologies, with a strong focus on code quality, developer experience, and a secure, robust architecture.

**Core Features:**
- Securely connect to the Canvas API using a user-provided token.
- Utilize the Canvas GraphQL API primarily, with REST as a fallback.
- Leverage a local SQLite database for caching and offline data.
- Provide a modern and consistent user interface using Instructure's own UI library.
- Enforce strict code quality and testing standards throughout the development process.

## 2. Core Technologies

- **Application Framework:** [Tauri](https://tauri.app/)
- **Frontend Framework:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [Instructure UI](https://instructure.design/)
- **Styling:** CSS Modules for custom styles.
- **Data & State Management:** [Effect](https://effect.website/) and [Effect Schema](https://effect.website/docs/schema/schema)
- **Database:** SQLite via [tauri-plugin-sql](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/sql)
- **Package Manager & Runtime:** [Bun](https://bun.sh/)
- **Linting & Formatting:** [Biome](https://biomejs.dev/)
- **Commit Hooks:** [Husky](https://typicode.github.io/husky/)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions)

## 3. Project Structure (Monorepo)

We will use a monorepo managed by `bun` workspaces to organize the codebase. This approach promotes code sharing and modularity.

```
/
├── apps/
│   └── panda/             # The main Tauri application
│       ├── src/           # Frontend React code
│       ├── src-tauri/     # Rust backend code
│       ├── tauri.conf.json
│       └── ...
├── packages/
│   ├── shared-lib/        # Shared logic, Effect schemas, API clients
│   │   └── src/
│   └── ui-components/     # Custom or wrapped InstUI components
│       └── src/
├── .github/
│   └── workflows/         # GitHub Actions CI/CD pipelines
├── .husky/                # Husky pre-commit hooks
├── biome.json             # Biome configuration
├── package.json           # Root package.json with workspace definitions
└── bun.lockb              # Bun lockfile
```

- **`apps/panda`**: The main application package. It will contain the Tauri-specific configuration and the frontend React code.
- **`packages/shared-lib`**: A shared library for code used across the monorepo. This is the ideal place for:
    - Canvas API client logic.
    - Effect schemas for API responses and database models.
    - Shared utility functions.
- **`packages/ui-components`**: A dedicated package for creating custom, reusable React components or wrapping components from Instructure UI for project-specific use cases.

## 4. Backend (Tauri + Rust)

### Database (SQLite)
- We will use the `tauri-plugin-sql` with the `sqlite` feature.
- The database file (e.g., `panda.db`) will be stored in the user's app config directory, managed automatically by Tauri.
- **Migrations:** Database schema changes will be managed via SQL migration files as supported by the plugin. Migrations will be defined in Rust (`src-tauri/src/main.rs`) and executed automatically on app startup.

### Secure API Token Storage
- To securely store the user's Canvas API token, we will use a keychain plugin like `tauri-plugin-keychain`.
- This plugin will interface with the operating system's native credential manager (macOS Keychain, Windows Credential Manager, Freedesktop Secret Service).
- The token will be retrieved from the keychain on startup and used to instantiate the API client.

## 5. Frontend (React + Vite)

### UI & Styling
- **Instructure UI:** Components from `@instructure/ui-core`, `@instructure/ui-layout`, etc., will be used for the main UI.
- **CSS Modules:** For any custom styling or component-specific overrides, we will use CSS Modules (`*.module.css`) to avoid global scope conflicts.

### Data Flow with Effect
- **API Calls:** All interactions with the Canvas API will be wrapped in `Effect`. This provides a robust, composable, and type-safe way to handle asynchronous operations, including built-in error handling and retries.
- **Schema Validation:** `Effect Schema` will be used to define the expected shape of API responses and database records. This ensures that all data flowing through the application is valid and conforms to our defined types, catching potential issues at the boundaries.

## 6. Development Workflow & Tooling

### Bun Workspaces
- All dependencies will be managed by `bun`.
- `bun install` in the root will install dependencies for all workspaces.
- Scripts will be run from the root `package.json` (e.g., `bun run -w @app/panda dev`).

### Biome
- A `biome.json` file in the root will configure formatting and linting rules.
- We will enforce zero tolerance for errors and warnings.
- The command `bun biome check --apply .` will be used to format and lint the entire codebase.

### Husky Pre-commit / Pre-push Hooks
We will use `husky` to configure git hooks that run checks before commits and pushes.

**`pre-commit`:**
1.  **Lint & Format:** Run `bun biome check --apply --staged` on staged files.
2.  **Test Coverage:** Run `bun test --coverage`. The test script will be configured to fail if coverage drops below 80%.
3.  **File Size Linting:** A custom script will check staged files and:
    - Warn if a file exceeds 500 lines.
    - Fail the commit if a file exceeds 700 lines.

**`pre-push`:**
- Run all `pre-commit` checks again to ensure the entire branch is clean before pushing.

## 7. Testing Strategy

- **Framework:** We will use `vitest` for unit and integration testing, as it integrates seamlessly with Vite.
- **Execution:** Tests for `.ts` and `.tsx` files will be run using the `bun test` command.
- **Coverage:** Test coverage will be collected using `vitest`'s native V8 provider. The 80% minimum coverage threshold will be configured in `vite.config.ts`.
- **Location:** Test files will be co-located with the source files (`*.test.ts`).

## 8. CI/CD with GitHub Actions

A workflow will be created in `.github/workflows/ci.yml` to automate quality checks.

**Trigger:** On every push to `main` or any pull request targeting `main`.

**Jobs:**
1.  **`lint_and_test`:**
    - Checks out the code.
    - Sets up `bun`.
    - Runs `bun install`.
    - Runs `bun biome check .` to verify formatting and linting.
    - Runs `bun test --coverage` to execute all tests and check the 80% coverage minimum.

2.  **`build_app` (depends on `lint_and_test`):**
    - Runs `bun run -w @app/panda build` to ensure the application builds successfully.

3.  **`release` (optional, on tag push):**
    - A separate workflow triggered by pushing a git tag (e.g., `v1.2.3`).
    - This job will build the Tauri application for macOS, Windows, and Linux.
    - It will then create a new GitHub Release and upload the compiled application binaries as assets.
