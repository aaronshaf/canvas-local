# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Canvas Local is a desktop application for interacting with Canvas LMS, built with Tauri, React, TypeScript, and Rust. The project uses a monorepo structure with functional programming patterns.

## Commands

### Development Setup
```bash
# Install dependencies (uses Bun)
bun install

# Run development server
bun dev

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Run a single test file
bun test path/to/test.spec.ts

# Build the application
bun build

# Lint and format code
bun lint
bun format

# Type checking
bun typecheck
```

### Tauri Commands
```bash
# Start Tauri development mode
bun tauri dev

# Build Tauri application for production
bun tauri build

# Build for specific platform
bun tauri build --target x86_64-pc-windows-msvc  # Windows
bun tauri build --target x86_64-apple-darwin    # macOS Intel
bun tauri build --target aarch64-apple-darwin   # macOS Apple Silicon
```

## Architecture

### Monorepo Structure
- `apps/canvas-local/` - Main Tauri desktop application
  - `src-tauri/` - Rust backend code
  - `src/` - React frontend code
- `packages/shared-lib/` - Shared business logic, API clients, and schemas
- `packages/ui-components/` - Custom and wrapped Instructure UI components

### Technology Stack
- **Frontend**: React + TypeScript + Vite + Instructure UI
- **Backend**: Tauri (Rust) + SQLite
- **State Management**: Effect and Effect Schema
- **API Integration**: Canvas GraphQL (primary) and REST APIs
- **Security**: OS keychain for token storage

### Key Design Patterns
1. **Functional Programming**: Using Effect for type-safe error handling and dependency injection
2. **Schema-First Development**: All data structures defined with Effect Schema
3. **API Abstraction**: Unified API client supporting both GraphQL and REST endpoints
4. **Offline-First**: Local SQLite database for caching and offline functionality

### Database Schema
Located in `packages/shared-lib/src/database/schema.sql`, includes tables for:
- users, courses, assignments, submissions
- discussion topics, entries, modules, pages
- files, folders, grades, enrollments

### Testing Strategy
- Minimum 80% code coverage requirement
- Unit tests for all utilities and components
- Integration tests for API interactions
- E2E tests for critical user workflows

## Development Guidelines

### File Size Limits
- Warning at 500 lines
- Build fails at 700 lines
- Split large files into smaller, focused modules

### Git Workflow
- Feature branches from main
- Conventional commit messages
- Pre-commit hooks run linting and tests

### API Integration
1. Always prefer GraphQL endpoints when available
2. Fall back to REST only when necessary
3. Use the unified API client in `packages/shared-lib`
4. Handle rate limiting and authentication errors gracefully

### Security Considerations
- Never store API tokens in code or config files
- Use OS keychain integration for secure token storage
- All API communications over HTTPS
- Validate all user inputs with Effect Schema