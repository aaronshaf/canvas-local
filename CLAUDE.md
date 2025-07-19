# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Panda is a desktop application for interacting with Canvas LMS, built with Tauri, React, TypeScript, and Rust. The project uses a monorepo structure with functional programming patterns.

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

# Run tests with coverage
bun test --coverage

# Run CI validation
bun run ci:validate

# Run quick CI checks (pre-push)
bun run ci:quick
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

## Important Note: Multiple Profiles Support

**Panda supports multiple profiles** - a person may be a student at multiple institutions. The architecture is designed to handle:
- Multiple Canvas instances (different domains)
- Multiple user accounts per instance
- Seamless switching between profiles
- Isolated data storage per profile

## Architecture

### Monorepo Structure
- `apps/canvas-local/` - Main Tauri desktop application
  - `src-tauri/` - Rust backend code (secure proxy layer only)
  - `src/` - React frontend code
- `packages/shared-lib/` - Shared business logic, API clients, and schemas
- `packages/ui-components/` - Custom and wrapped Instructure UI components

### Development Tooling
- **Package Manager**: Bun (not npm/yarn/pnpm)
- **Test Runner**: Bun test (not Vitest/Jest)
- **Code Quality**: Biome for formatting and linting
- **Type Checking**: TypeScript with strict mode and isolatedDeclarations
- **Pre-commit Hooks**: Husky + lint-staged
- **Additional Checks**: ast-grep for type assertion validation

### Core Principle: TypeScript Business Logic
- **All business logic stays in TypeScript** (packages/shared-lib)
- **Rust serves only as a secure proxy** for API requests and OS integration
- GraphQL/REST requests originate from the frontend and are proxied through Rust
- This keeps the codebase maintainable and allows for better code reuse

### Technology Stack
- **Frontend**: React + TypeScript + Vite + Instructure UI
- **Routing**: TanStack Router (file-based, type-safe routing)
- **Data Fetching**: TanStack Query + Effect (caching and state management)
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
- Minimum 1% code coverage requirement (will be increased as codebase matures)
- Unit tests for all utilities and components
- Integration tests for API interactions
- E2E tests for critical user workflows
- Tests run on pre-commit and pre-push hooks

## Development Guidelines

### TypeScript Strictness
- Never use explicit `any` or implicit `any` types (enforced by biome with `noExplicitAny`)
- Avoid type casting with `as` (except `as const` or `as unknown`) - ast-grep rule configured but not yet enforced
- Use proper type inference and generic types instead
- Define explicit types for all function parameters and return values
- Strict mode enabled with `noImplicitAny` and all strict checks

### File Size Limits
- Warning at 500 lines
- Build fails at 700 lines
- Split large files into smaller, focused modules

### Git Workflow
- Feature branches from main
- Conventional commit messages
- Pre-commit hooks:
  - Formatting (biome format)
  - Linting (biome lint with noExplicitAny)
  - Type checking (TypeScript)
  - Unit tests
  - File size limits (500 line warning, 700 line error)
  - ast-grep check for forbidden `as` typecasting
- Pre-push hooks:
  - Quick CI validation (lint, type-check, tests)

### API Integration
1. Always prefer GraphQL endpoints when available
2. Fall back to REST only when necessary
3. Use the unified API client in `packages/shared-lib`
4. Handle rate limiting and authentication errors gracefully

### Security Considerations
- Never store API tokens in code or config files
- No hardcoded secrets or sensitive data in the repository
- Use OS keychain integration for secure token storage
- All API communications over HTTPS
- Validate all user inputs with Effect Schema
- Regular checks for sensitive data in commits